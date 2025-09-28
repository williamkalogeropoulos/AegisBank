import { useTheme } from '../contexts/ThemeContext'
import { Button } from './ui/button'
import { Sun, Moon } from 'lucide-react'

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="flex items-center space-x-2 bg-blue-50 hover:bg-blue-100 text-blue-900 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-100 rounded-xl px-3 py-2 transition-all duration-300 hover:scale-105"
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4 transition-transform duration-300" />
      ) : (
        <Sun className="h-4 w-4 transition-transform duration-300" />
      )}
      <span className="hidden sm:block font-medium">
        {theme === 'light' ? 'Dark' : 'Light'}
      </span>
    </Button>
  )
}

