import { createUploadthing, type FileRouter } from "uploadthing/next";

import { auth } from "@clerk/nextjs/server";
//import { isTeacher } from '@/lib/teacher'

const f = createUploadthing();
 
const handleAuth = () => {
    const { userId } = auth()
      //optional admin protection  || !isTeacher(userId)
      // const isAuthorized = isTeacher(userId) 

    if ( !userId ) throw new Error('Unauthorized')
        return { userId }

  
}
 
// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  courseImage: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
      // Set permissions and file types for this FileRoute
      .middleware(() => handleAuth())
      .onUploadComplete(() => {}),
      courseAttachment: f(['text', 'image', 'video', 'audio', 'pdf'])
      .middleware(() => handleAuth())
      .onUploadComplete(() => {}),
    chapterVideo: f({ video: { maxFileCount: 1, maxFileSize: '512GB' } })
      .middleware(() => handleAuth())
      .onUploadComplete(() => {}), 
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;