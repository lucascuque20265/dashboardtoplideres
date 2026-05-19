import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

const ADMIN_PASSWORD = 'secomsptop';

interface AdminPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  isLoggingOut?: boolean;
}

export function AdminPasswordDialog({ open, onOpenChange, onSuccess, isLoggingOut }: AdminPasswordDialogProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === ADMIN_PASSWORD) {
      setPassword('');
      setError('');
      onSuccess();
      onOpenChange(false);
    } else {
      setError('Senha incorreta');
      setPassword('');
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setPassword('');
      setError('');
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {isLoggingOut ? 'Sair do Modo Admin' : 'Acessar Modo Admin'}
          </DialogTitle>
          <DialogDescription>
            {isLoggingOut 
              ? 'Tem certeza que deseja sair do modo admin?' 
              : 'Digite a senha para acessar o modo administrador'}
          </DialogDescription>
        </DialogHeader>

        {isLoggingOut ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Você perderá acesso às funções de edição e exclusão.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Digite a senha..."
                  autoFocus
                  className={error ? 'border-red-500 focus:border-red-500' : ''}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
            </div>
          </form>
        )}

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          {isLoggingOut ? (
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                onSuccess();
                handleOpenChange(false);
              }}
            >
              Sair do Admin
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!password}
            >
              Acessar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
