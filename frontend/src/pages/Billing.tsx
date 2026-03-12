import { useStore } from '../stores/useStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Check, Zap, Shield, Users, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Billing() {
  const { user, analytics } = useStore();

  const plans = [
    {
      name: 'FREE',
      price: '$0',
      period: '/month',
      description: 'Perfect for testing and small projects.',
      features: [
        '1,000 requests/month',
        'Basic security scanning',
        'Community support',
        '1 API Key'
      ],
      cta: 'Current Plan',
      popular: false,
      icon: Activity
    },
    {
      name: 'PRO',
      price: '$19',
      period: '/month',
      description: 'For production applications and startups.',
      features: [
        '50,000 requests/month',
        'Deep semantic scanning',
        'Advanced threat detection',
        'Email support',
        '5 API Keys'
      ],
      cta: 'Upgrade to Pro',
      popular: true,
      icon: Zap
    },
    {
      name: 'BUSINESS',
      price: '$49',
      period: '/month',
      description: 'For enterprise teams requiring maximum security.',
      features: [
        'Unlimited requests',
        'Dedicated threat intelligence',
        'Team dashboard',
        'Priority 24/7 support',
        'Unlimited API Keys'
      ],
      cta: 'Contact Sales',
      popular: false,
      icon: Shield
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-6xl mx-auto"
    >
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl font-bold tracking-tight">Simple, transparent pricing</h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Protect your LLM applications from prompt injections, data leaks, and malicious actors.
        </p>
      </div>

      {analytics && (
        <Card className="bg-slate-900/40 border-white/5 mb-12">
          <CardHeader>
            <CardTitle>Current Usage</CardTitle>
            <CardDescription>You are currently on the {user?.tier} plan.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">API Requests</span>
                <span className="font-medium text-slate-200">{analytics.usageVsLimit.used.toLocaleString()} / {analytics.usageVsLimit.limit.toLocaleString()}</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                  style={{ width: `${(analytics.usageVsLimit.used / analytics.usageVsLimit.limit) * 100}%` }}
                />
              </div>
              <p className="text-xs text-slate-500">Resets in 12 days</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <Card 
            key={plan.name} 
            className={`relative flex flex-col ${plan.popular ? 'border-indigo-500/50 shadow-lg shadow-indigo-500/10 bg-slate-900/80' : 'border-white/5 bg-slate-900/40'}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 inset-x-0 flex justify-center">
                <span className="bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Most Popular
                </span>
              </div>
            )}
            <CardHeader>
              <div className="flex items-center space-x-2 mb-2">
                <plan.icon className={`w-5 h-5 ${plan.popular ? 'text-indigo-400' : 'text-slate-400'}`} />
                <CardTitle className="text-lg text-slate-300">{plan.name}</CardTitle>
              </div>
              <div className="flex items-baseline space-x-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-slate-400">{plan.period}</span>
              </div>
              <CardDescription className="pt-4">{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start space-x-3 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-[#32FF7E] flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                variant={plan.popular ? 'default' : 'outline'}
                disabled={user?.tier === plan.name}
              >
                {user?.tier === plan.name ? 'Current Plan' : plan.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-16 text-center">
        <p className="text-sm text-slate-500 flex items-center justify-center space-x-2">
          <Shield className="w-4 h-4" />
          <span>Secure payments processed by Stripe. Cancel anytime.</span>
        </p>
      </div>
    </motion.div>
  );
}
