import * as React from "react";
import { Check, Link2, Linkedin, Share2, MessageCircle, Twitter } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toaster";

interface ShareButtonProps {
  title: string;
  url: string;
  variant?: "icon" | "full";
  className?: string;
}

function buildLinks(url: string, title: string) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  return [
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      Icon: Twitter,
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      Icon: MessageCircle,
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      Icon: Linkedin,
    },
  ];
}

export function ShareButton({ title, url, variant = "icon", className }: ShareButtonProps) {
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({ title: "Link copied" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Couldn't copy link", variant: "destructive" });
    }
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // user cancelled
      }
    } else {
      await copyLink();
    }
  };

  const trigger =
    variant === "full" ? (
      <Button variant="outline" className={className}>
        <Share2 className="h-4 w-4" aria-hidden="true" />
        Share
      </Button>
    ) : (
      <button
        aria-label="Share this story"
        className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-mist transition-colors hover:bg-line/50 hover:text-ink ${className ?? ""}`}
      >
        <Share2 className="h-5 w-5" aria-hidden="true" />
      </button>
    );

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share this story</DialogTitle>
          <DialogDescription className="line-clamp-2">{title}</DialogDescription>
        </DialogHeader>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Button variant="outline" onClick={nativeShare}>
            <Share2 className="h-4 w-4" aria-hidden="true" />
            Share…
          </Button>
          <Button variant="outline" onClick={copyLink}>
            {copied ? (
              <Check className="h-4 w-4 text-accent" aria-hidden="true" />
            ) : (
              <Link2 className="h-4 w-4" aria-hidden="true" />
            )}
            {copied ? "Copied" : "Copy link"}
          </Button>
          {buildLinks(url, title).map(({ label, href, Icon }) => (
            <Button key={label} variant="outline" asChild>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="gap-2"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </a>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}