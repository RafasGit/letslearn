import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
//import { isTeacher } from '@/lib/teacher'

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const { userId } = auth()
    //optional admin protection  || !isTeacher(userId)

  if ((!userId)) {
    return redirect('/')
  }

  return <>{children}</>
}