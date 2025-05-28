import { Loader } from "lucide-react";

export const LoadingMessage = () => (
  <div className="p-4 bg-blue-50 rounded-lg flex gap-3 items-center">
    <Loader className="animate-spin h-5 w-5 text-blue-600" />
    <div>
      <h3 className="font-medium text-blue-800">Analyzing...</h3>
      <p className="text-blue-700 text-sm">This may take up to 50 seconds.</p>
    </div>
  </div>
);
