import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

  <DropdownMenuItem 
    className="text-destructive focus:text-destructive cursor-pointer"
    onClick={() => signOut({ 
      callbackUrl: '/',
      redirect: true 
    })}
  >
    <LogOut className="mr-2 h-4 w-4" />
    <span>Çıkış Yap</span>
  </DropdownMenuItem> 