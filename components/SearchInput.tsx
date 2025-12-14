"use client"; 

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export default function SearchInput() {

  // Get current URL query parameters (e.g. ?query=design)
  const searchParams = useSearchParams();

  // Get current page path (e.g. /search)
  const pathname = usePathname();

  // Router method to replace URL without reloading the page
  const { replace } = useRouter();

  // This function runs ONLY after user stops typing for 300ms
  const handleSearch = useDebouncedCallback((term: string) => {

    // Create a writable copy of the current query parameters
    const params = new URLSearchParams(searchParams);

    // If user typed something, add/update the "query" parameter
    if (term) {
      params.set("query", term);
    } 
    // If input is empty, remove the "query" parameter
    else {
      params.delete("query");
    }

    // Update the URL without refreshing the page
    // Example: /search → /search?query=design
    replace(`${pathname}?${params.toString()}`);

  }, 300); 

  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />

      <Input
        className="pl-10 bg-white" 
        placeholder="Search for services..."
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get("query")?.toString()}
      />
    </div>
  );
}
