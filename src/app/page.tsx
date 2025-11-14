import { Button } from "@/components/ui/button";
import { Search } from "lucide-react"
import { ArrowRight } from 'lucide-react';
import Link from 'next/link'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupTextarea,
} from "@/components/ui/input-group"
export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="grid w-full max-w-sm gap-6">
      <p>what do you want to learn</p>
      <InputGroup>
        <InputGroupInput placeholder="Topic I want to learn..." />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
      </InputGroup>
      <p>Tell me the part you want to learn the most, and previous experience about this topic</p>
      <InputGroup>
        <InputGroupTextarea placeholder="Ask, Search or Chat..." />
      </InputGroup>
      </div>
      <Link href="/roadmap">
      <Button size="sm" variant="outline" className="mt-2">
          <ArrowRight />
      </Button>
      </Link>
    </div>
  );
}
