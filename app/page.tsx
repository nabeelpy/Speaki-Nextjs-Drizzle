// Pure Server Component — zero client JS at the page level
import Header               from '@/components/layout/Header'
import Footer               from '@/components/layout/Footer'
import HeroSection          from '@/components/sections/HeroSection'
import StatsSection         from '@/components/sections/StatsSection'
import HowItWorksSection    from '@/components/sections/HowItWorksSection'
import CoursesSection       from '@/components/sections/CoursesSection'
import FeaturesSection      from '@/components/sections/FeaturesSection'
import TestimonialsSection  from '@/components/sections/TestimonialsSection'
import PricingSection       from '@/components/sections/PricingSection'
import FaqSection           from '@/components/sections/FaqSection'
import CtaBanner            from '@/components/sections/CtaBanner'
// app/layout.tsx
import './styles/main.css'

export default function HomePage() {
    return (
        <>
            <Header />
            <main>
                <HeroSection />
                <StatsSection />
                <HowItWorksSection />
                <CoursesSection />
                <FeaturesSection />
                <TestimonialsSection />
                <PricingSection />
                <FaqSection />
                <CtaBanner />
            </main>
            <Footer />
        </>
    )
}