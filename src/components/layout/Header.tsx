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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { siteConfig, calculatorPages } from "@/config/site.config";

const otherNavLinks = [
  { label: "Debt", href: "/debt" },
  { label: "Auto", href: "/auto" },
  { label: "Home Buying", href: "/home-buying" },
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
          {/* Loans dropdown — populated from calculatorPages */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground/70 hover:text-muted-foreground transition-colors">
                Loans
                <ChevronDown className="size-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {calculatorPages.map((p) => (
                <DropdownMenuItem key={p.href} asChild>
                  <Link href={p.href}>{p.label}</Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/loans">All Loan Calculators</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Static department links */}
          {otherNavLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground/70 hover:text-muted-foreground transition-colors"
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
          <SheetContent side="right" className="w-80 overflow-y-auto">
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
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                Loans
              </Link>
              {calculatorPages.map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-md pl-6 pr-3 py-1.5 text-sm text-muted-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
                >
                  {p.label}
                </Link>
              ))}
              <Link
                href="/loans"
                onClick={() => setMobileOpen(false)}
                className="block rounded-md pl-6 pr-3 py-1.5 text-sm text-muted-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
              >
                All Loan Calculators
              </Link>

              {/* Other departments */}
              {otherNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-2 text-sm text-muted-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
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
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                About
              </Link>
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-2 text-sm text-muted-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
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