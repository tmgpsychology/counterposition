import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { AccountHeader } from "@/components/account-header";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Counterposition from "@/pages/counterposition";
import ProsCons from "@/pages/pros-cons";
import Unthread from "@/pages/unthread";
import Disclaimer from "@/pages/disclaimer";
import AuthPage from "@/pages/auth-page";
import History from "@/pages/history";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home}/>
      <Route path="/counterposition" component={Counterposition}/>
      <Route path="/weigh-it-up" component={ProsCons}/>
      <Route path="/unthread" component={Unthread}/>
      <Route path="/terms" component={Disclaimer}/>
      <Route path="/account" component={AuthPage}/>
      <Route path="/history" component={History}/>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <AccountHeader />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
