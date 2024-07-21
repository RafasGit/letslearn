import { currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/lib/db'
import { stripe } from '@/lib/stripe'

// interface Course {
//   id: string;
//   createdById: string;
//   title: string;
//   description: string | null; // Now accepts string or null
//   imageUrl: string | null;
//   price: number | null;
//   isPublished: boolean;
//   categoryId: string | null;
//   createdAt: Date;
//   updatedAt: Date;
// }

// async function findCourseWithRetry(params: { courseId: string }, maxAttempts: number = 5): Promise<Course | null> {
//   let course;
//   for (let attempt = 1; attempt <= maxAttempts; attempt++) {
//       course = await db.course.findUnique({ where: { id: params.courseId, isPublished: true } });
//       if (course) {
//           return course;
//       }
//       // Optionally, include a delay before the next attempt
//       // await new Promise(resolve => setTimeout(resolve, 1000)); // Delay of 1 second
//   }
//   return null;
// }

export async function POST(req: NextRequest, { params }: { params: { courseId: string } }) {
    try {
      const user = await currentUser()
      if (!user || !user.id || !user.emailAddresses?.[0]?.emailAddress) {
        return new NextResponse('Unauthorized', { status: 401 })
      }
      console.log(`Attempting to find course with ID: ${params.courseId}`)
      const course = await db.course.findUnique({ where: { id: params.courseId, isPublished: true } });
     
      if (!course) {
        return new NextResponse('Course not found!', { status: 404 })
      }
  
      const purchase = await db.purchase.findUnique({
        where: { userId_courseId: { userId: user.id, courseId: params.courseId } },
      })
  
      if (purchase) {
        return new NextResponse('Already purchased', { status: 400 })
      }
  
      const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [
        {
          quantity: 1,
          price_data: {
            currency: 'USD',
            product_data: {
              name: course.title,
              description: course.description!,
            },
            unit_amount: Math.round(course.price! * 100),
          },
        },
      ]

      let stripeCustomer = await db.stripeCustomer.findUnique({
        where: { userid: user.id },
        select: { stripeCustomerId: true },
      })
  
      if (!stripeCustomer) {
        const customer = await stripe.customers.create({ email: user.emailAddresses[0].emailAddress })
  
        stripeCustomer = await db.stripeCustomer.create({ data: { userid: user.id, stripeCustomerId: customer.id } })
      }

      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomer.stripeCustomerId,
        line_items,
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${course.id}?success=1`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${course.id}?cancelled=1`,
        metadata: {
          courseId: course.id, 
          userId: user.id,
        },
      })
  
      return NextResponse.json({ url: session.url })
    } catch {
      return new NextResponse('Internal server error', { status: 500 })
    }
  }