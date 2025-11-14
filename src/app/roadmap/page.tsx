import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import Link from "next/link";

import { roadmapItems } from "@/lib/data";

const RoadmapPage = () => {
  return (
    <div className="relative">
      {/* vertical line */}
      <div className="absolute left-4 top-0 h-full w-px bg-muted" />
      <div className="space-y-4">
        {roadmapItems.map((it, i) => {

          return (
            <div key={it.id} className="relative pl-10">
              {/* dot */}
              
              <Dialog>
                <DialogTrigger asChild>
                    <Card className="overflow-hidden w-80 cursor-pointer">
                        <CardHeader className="flex flex-row items-start justify-between gap-2">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                            {it.title}
                            <Badge variant="secondary">Level {it.level}</Badge>
                            </CardTitle>
                        </div>
                        <Badge
                            variant={
                            it.status === "done"
                                ? "default"
                                : it.status === "in_progress"
                                ? "secondary"
                                : "outline"
                            }
                        >
                            {it.status.replace("_", " ")}
                        </Badge>
                        </CardHeader>

                        <Separator />
                            <CardContent className="py-1">
                            <div className="mb-2 text-sm text-muted-foreground">
                                Progress
                            </div>
                            <Progress value={it.progress ?? (it.status === "done" ? 100 : 0)} />
                            </CardContent>

                    </Card>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>{it.title}</DialogTitle>
                    <DialogDescription>
                      {it.summary}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                        <div className="text-sm text-muted-foreground mb-2">Study Material</div>
                        <div className="grid gap-2">
                        {it.study_material.map((mat, idx) => <div key={idx}>{mat}</div>)}
                        </div>
                    </div>
                    <Separator />
                    <div>
                    <div className="mb-2 text-sm text-muted-foreground">
                        Progress
                    </div>
                    <Progress value={it.progress ?? (it.status === "done" ? 100 : 0)} />
                    </div>
                    
                  </div>
                  <DialogFooter className="sm:justify-start">
                    <DialogClose asChild>
                      <Button type="button" variant="secondary">
                        Close
                      </Button>
                    </DialogClose>
                    <Link href={`/quiz/${it.id}`} className="ml-auto">
                      <Button >Quiz</Button>
                    </Link>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RoadmapPage
