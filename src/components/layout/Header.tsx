"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Menu, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { siteConfig } from "@/config/site.config";
import { PAYCHECK_STUBS } from "@/lib/stubs-registry";
import { DEPARTMENTS } from "@/lib/departments";

/* ─── Menu item definitions ─── */
const paycheckMenuItems = [
  { label: "Paycheck Calculator", href: "/paycheck/calculator", stub: false },
  { label: "Paycheck by State", href: "/paycheck#states", stub: false, hasSubArrow: true },
  { label: "Bonus Tax Calculator", href: "/paycheck/bonus-tax", stub: true },
  { label: "No Tax on Overtime", href: "/paycheck/no-tax-on-overtime", stub: true },
  { label: "No Tax on Tips", href: "/paycheck/no-tax-on-tips", stub: true },
  { label: "Salary ⇄ Hourly", href: "/paycheck/salary-to-hourly", stub: true },
];

const inactiveDepartments = DEPARTMENTS.filter((d) => !d.live);

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
          {/* Paycheck & Salary Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-1.5 text-sm font-medium">
                Paycheck &amp; Salary
                <ChevronDown className="size-3.5 opacity-60" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {paycheckMenuItems.map((item) => (
                <DropdownMenuItem key={item.href} asChild disabled={false}>
                  <Link href={item.href} className="flex items-center justify-between cursor-pointer">
                    <span className={item.stub ? "text-muted-foreground" : ""}>
                      {item.label}
                    </span>
                    {item.hasSubArrow && (
                      <ChevronRight className="size-3.5 text-muted-foreground" />
                    )}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/paycheck" className="flex items-center justify-between cursor-pointer">
                  <span>View All Calculators</span>
                  <ChevronRight className="size-3.5 text-muted-foreground" />
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Inactive department links */}
          {inactiveDepartments.map((dept) => (
            <a
              key={dept.slug}
              href={dept.href}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground/70 hover:text-muted-foreground transition-colors"
            >
              {dept.shortName}
            </a>
          ))}

          {/* About */}
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
              {/* Paycheck & Salary Section */}
              <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Paycheck &amp; Salary
              </p>
              {paycheckMenuItems.map((item) => (
                <div key={item.href} className="flex items-center gap-2">
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent flex-1 ${
                      item.stub ? "text-muted-foreground" : "font-medium text-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                </div>
              ))}
              <Link
                href="/paycheck"
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-ember transition-colors hover:bg-accent flex items-center justify-between"
              >
                View All Calculators
                <ChevronRight className="size-4" />
              </Link>

              <div className="my-3 h-px bg-border" />

              {/* Inactive departments */}
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                More Calculators
              </p>
              {inactiveDepartments.map((dept) => (
                <div
                  key={dept.slug}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground/70"
                >
                  <span>{dept.name}</span>
                </div>
              ))}

              <div className="my-3 h-px bg-border" />

              {/* About */}
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
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}