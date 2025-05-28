import { AlertCircle } from "lucide-react";

export const ErrorMessage = ({ message }: { message: string }) => (
  <div className="p-4 bg-red-50 rounded-lg flex gap-3 items-start">
    <AlertCircle className="text-red-600 mt-1 h-5 w-5" />
    <div>
      <h3 className="font-medium text-red-800">Error</h3>
      <p className="text-red-700 text-sm">{message}</p>
    </div>
  </div>
);
