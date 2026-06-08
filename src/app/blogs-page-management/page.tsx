import React from 'react';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import BlogPageManager from "../../components/common/BlogPageManager";


const BlogsPage = () => {
  return (
    <Suspense fallback={<div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#8d6a3a]" size={40} /></div>}>
      <BlogPageManager />
    </Suspense>
  );
};

export default BlogsPage;