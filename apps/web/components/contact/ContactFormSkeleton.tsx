'use client'

import { Card, Skeleton } from '@maison/ui'

export function ContactFormSkeleton() {
  return (
    <>
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 text-center space-y-4">
            <Skeleton className="w-8 h-8 mx-auto rounded-full" /><div className="space-y-2"><Skeleton className="h-4 w-20 mx-auto" /><Skeleton className="h-3 w-32 mx-auto" /></div>
          </Card>
        ))}
      </div>
      <Card className="p-8 bg-secondary/40 mt-12 relative overflow-hidden">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64 mb-6" />
          {[24, 16, 24].map((w, i) => <div key={i} className="space-y-2"><Skeleton className={`h-4 w-${w}`} /><Skeleton className="h-10 w-full" /></div>)}
          <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-32 w-full" /></div>
          <Skeleton className="h-12 w-full" />
        </div>
      </Card>
    </>
  )
}
