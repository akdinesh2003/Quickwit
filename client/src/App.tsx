import { Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@fontsource/inter";
import QuizApp from "@/components/quiz/QuizApp";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="w-full h-screen overflow-hidden">
        <Suspense fallback={
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
            <div className="text-2xl text-white font-light">Loading QuizMaster Live...</div>
          </div>
        }>
          <QuizApp />
        </Suspense>
      </div>
    </QueryClientProvider>
  );
}

export default App;
