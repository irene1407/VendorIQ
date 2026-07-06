import { AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-in fade-in zoom-in-95 duration-500">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <h1 className="text-4xl font-display font-bold tracking-tight mb-2">404 - Page Not Found</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        The requested intelligence view could not be located in the VendorIQ system. 
        It may have been moved or you might lack the required clearance level.
      </p>
      <Link href="/">
        <Button size="lg" className="font-medium">
          Return to Command Center
        </Button>
      </Link>
    </div>
  );
}
