import { Link } from "wouter";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-12 h-12 text-red-600" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">404</h1>
        <p className="text-lg text-muted-foreground">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/">
          <button className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
            Back to Dashboard
          </button>
        </Link>
      </div>
    </div>
  );
}
