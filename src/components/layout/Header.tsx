"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { siteConfig, calculatorPages } from "@/config/site.config";

const loanCalculators = calculatorPages.filter((p) => p.category === "loans");
const debtCalculators = calculatorPages.filter((p) => p.category === "debt");
const autoCalculators = [
  calculatorPages.find((p) => p.href === "/loans/auto-loan-calculator")!,
  ...calculatorPages.filter((p) => p.category === "auto"),
];
const homeBuyingCalculators = calculatorPages.filter((p) => p.category === "home-buying");

const otherNavLinks = [
  { label: "Insurance", href: "/insurance" },
];

const footerLinks = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Disclaimer", href: "/disclaimer" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <Image
            src="/logo.png"
            alt="CalcForge"
            width={32}
            height={32}
            className="size-8"
            priority
          />
          <span className="text-xl font-bold tracking-tight text-slate-deep dark:text-slate-foreground">
            Calc<span className="text-ember">Forge</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {/* Loans dropdown (populated from calculatorPages) */}
          <div className="group relative">
            <button className="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground/70 hover:text-muted-foreground transition-colors">
              Loans
              <ChevronDown className="size-3.5 transition-transform duration-200 group-hover:rotate-180" />
            </button>
            <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute top-full left-0 z-50 pt-1 transition-[opacity,visibility] duration-150">
              <div className="w-[298px] overflow-x-hidden overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
                {loanCalculators.map((p) => (
                  <Link
                    key={p.href}
                    href={p.href}
                    className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden whitespace-nowrap transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    {p.label}
                  </Link>
                ))}
                <div className="-mx-1 my-1 h-px bg-border" />
                <Link
                  href="/loans"
                  className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  All Loan Calculators
                </Link>
              </div>
            </div>
          </div>

          {/* Debt dropdown (populated from calculatorPages) */}
          <div className="group relative">
            <button className="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground/70 hover:text-muted-foreground transition-colors">
              Debt
              <ChevronDown className="size-3.5 transition-transform duration-200 group-hover:rotate-180" />
            </button>
            <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute top-full left-0 z-50 pt-1 transition-[opacity,visibility] duration-150">
              <div className="w-[298px] overflow-x-hidden overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
                {debtCalculators.map((p) => (
                  <Link
                    key={p.href}
                    href={p.href}
                    className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden whitespace-nowrap transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    {p.label}
                  </Link>
                ))}
                <div className="-mx-1 my-1 h-px bg-border" />
                <Link
                  href="/debt"
                  className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  All Debt Calculators
                </Link>
              </div>
            </div>
          </div>

          {/* Auto dropdown */}
          <div className="group relative">
            <button className="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground/70 hover:text-muted-foreground transition-colors">
              Auto
              <ChevronDown className="size-3.5 transition-transform duration-200 group-hover:rotate-180" />
            </button>
            <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute top-full left-0 z-50 pt-1 transition-[opacity,visibility] duration-150">
              <div className="w-[298px] overflow-x-hidden overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
                {autoCalculators.map((p) => (
                  <Link
                    key={p.href}
                    href={p.href}
                    className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden whitespace-nowrap transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    {p.label}
                  </Link>
                ))}
                <div className="-mx-1 my-1 h-px bg-border" />
                <Link
                  href="/auto"
                  className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  All Auto Calculators
                </Link>
              </div>
            </div>
          </div>

          {/* Home Buying dropdown */}
          <div className="group relative">
            <button className="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground/70 hover:text-muted-foreground transition-colors">
              Home Buying
              <ChevronDown className="size-3.5 transition-transform duration-200 group-hover:rotate-180" />
            </button>
            <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute top-full left-0 z-50 pt-1 transition-[opacity,visibility] duration-150">
              <div className="w-[298px] overflow-x-hidden overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
                {homeBuyingCalculators.map((p) => (
                  <Link
                    key={p.href}
                    href={p.href}
                    className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden whitespace-nowrap transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    {p.label}
                  </Link>
                ))}
                <div className="-mx-1 my-1 h-px bg-border" />
                <Link
                  href="/home-buying"
                  className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  All Home Buying Calculators
                </Link>
              </div>
            </div>
          </div>

          {/* Static department links */}
          {otherNavLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground/70 hover:text-muted-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="mx-2 h-5 w-px bg-border" />
          <Button variant="ghost" asChild>
            <Link href="/about" className="text-sm font-medium">
              About
            </Link>
          </Button>
        </nav>

        {/* Mobile Hamburger */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[85vw] sm:w-80 overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2.5">
                <Image
                  src="/logo.png"
                  alt="CalcForge"
                  width={24}
                  height={24}
                  className="size-6"
                />
                <span className="font-bold text-slate-deep dark:text-slate-foreground">
                  Calc<span className="text-ember">Forge</span>
                </span>
              </SheetTitle>
            </SheetHeader>

            <nav className="flex flex-col gap-1 px-4 pb-8" aria-label="Mobile navigation">
              <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Calculators
              </p>

              {/* Loans section */}
              <Link
                href="/loans"
                onClick={() => setMobileOpen(false)}
                className="cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                Loans
              </Link>
              {loanCalculators.map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  onClick={() => setMobileOpen(false)}
                  className="block cursor-pointer rounded-md pl-6 pr-3 py-1.5 text-sm text-muted-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
                >
                  {p.label}
                </Link>
              ))}
              <Link
                href="/loans"
                onClick={() => setMobileOpen(false)}
                className="block cursor-pointer rounded-md pl-6 pr-3 py-1.5 text-sm text-muted-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
              >
                All Loan Calculators
              </Link>

              {/* Debt section */}
              <Link
                href="/debt"
                onClick={() => setMobileOpen(false)}
                className="cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                Debt
              </Link>
              {debtCalculators.map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  onClick={() => setMobileOpen(false)}
                  className="block cursor-pointer rounded-md pl-6 pr-3 py-1.5 text-sm text-muted-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
                >
                  {p.label}
                </Link>
              ))}
              <Link
                href="/debt"
                onClick={() => setMobileOpen(false)}
                className="block cursor-pointer rounded-md pl-6 pr-3 py-1.5 text-sm text-muted-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
              >
                All Debt Calculators
              </Link>

              {/* Auto section */}
              <Link
                href="/auto"
                onClick={() => setMobileOpen(false)}
                className="cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                Auto
              </Link>
              {autoCalculators.map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  onClick={() => setMobileOpen(false)}
                  className="block cursor-pointer rounded-md pl-6 pr-3 py-1.5 text-sm text-muted-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
                >
                  {p.label}
                </Link>
              ))}
              <Link
                href="/auto"
                onClick={() => setMobileOpen(false)}
                className="block cursor-pointer rounded-md pl-6 pr-3 py-1.5 text-sm text-muted-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
              >
                All Auto Calculators
              </Link>

              {/* Home Buying section */}
              <Link
                href="/home-buying"
                onClick={() => setMobileOpen(false)}
                className="cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                Home Buying
              </Link>
              {homeBuyingCalculators.map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  onClick={() => setMobileOpen(false)}
                  className="block cursor-pointer rounded-md pl-6 pr-3 py-1.5 text-sm text-muted-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
                >
                  {p.label}
                </Link>
              ))}
              <Link
                href="/home-buying"
                onClick={() => setMobileOpen(false)}
                className="block cursor-pointer rounded-md pl-6 pr-3 py-1.5 text-sm text-muted-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
              >
                All Home Buying Calculators
              </Link>

              {/* Other departments */}
              {otherNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="cursor-pointer rounded-md px-3 py-2 text-sm text-muted-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}

              <div className="my-3 h-px bg-border" />

              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Company
              </p>
              <Link
                href="/about"
                onClick={() => setMobileOpen(false)}
                className="cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                About
              </Link>
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="cursor-pointer rounded-md px-3 py-2 text-sm text-muted-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}