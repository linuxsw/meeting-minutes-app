import React from 'react';
import { useRouter } from 'next/router';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'ko', name: '한국어' },
  { code: 'ja', name: '日本語' }
];

export default function LanguageSwitcher() {
  const router = useRouter();
  const { pathname, asPath, query } = router;
  
  const changeLanguage = (locale: string) => {
    router.push({ pathname, query }, asPath, { locale });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 px-0">
          <Globe className="h-4 w-4" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem 
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={router.locale === language.code ? "font-bold" : ""}
          >
            {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
