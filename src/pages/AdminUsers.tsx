import { useState, useEffect } from 'react';
import { Users, KeyRound, RefreshCw, Copy, Check, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AuthUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
}

const ADMIN_FN = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-ops`;

async function callAdminFn(body: object) {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(ADMIN_FN, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok && res.headers.get('content-type')?.includes('text/html')) {
    return { error: 'Edge Function não deployada. Veja as instruções no README.' };
  }
  return res.json();
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog novo usuário
  const [newUserDialog, setNewUserDialog] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newUserLoading, setNewUserLoading] = useState(false);

  // Dialog alterar senha
  const [pwDialog, setPwDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  // Dialog link de recuperação
  const [linkDialog, setLinkDialog] = useState(false);
  const [recoveryLink, setRecoveryLink] = useState('');
  const [linkLoading, setLinkLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('admin_list_users');
    if (error) {
      toast.error('Erro ao listar usuários', { description: error.message });
    } else {
      setUsers(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreateUser = async () => {
    if (!newEmail || newPassword.length < 6) {
      toast.error('Preencha e-mail e senha (mín. 6 caracteres)');
      return;
    }
    setNewUserLoading(true);
    const data = await callAdminFn({ action: 'create_user', email: newEmail, password: newPassword });
    setNewUserLoading(false);
    if (data.error) {
      toast.error('Erro ao criar usuário', { description: data.error });
    } else {
      toast.success('Usuário criado com sucesso!');
      setNewUserDialog(false);
      setNewEmail('');
      setNewPassword('');
      fetchUsers();
    }
  };

  const openPwDialog = (user: AuthUser) => {
    setSelectedUser(user);
    setNewPassword('');
    setPwDialog(true);
  };

  const handleUpdatePassword = async () => {
    if (!selectedUser || newPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    setPwLoading(true);
    const data = await callAdminFn({
      action: 'update_password',
      userId: selectedUser.id,
      password: newPassword,
    });
    setPwLoading(false);
    if (data.error) {
      toast.error('Erro ao alterar senha', { description: data.error });
    } else {
      toast.success('Senha alterada com sucesso!');
      setPwDialog(false);
    }
  };

  const handleGenerateLink = async (user: AuthUser) => {
    setSelectedUser(user);
    setRecoveryLink('');
    setCopied(false);
    setLinkDialog(true);
    setLinkLoading(true);
    const data = await callAdminFn({
      action: 'generate_recovery_link',
      email: user.email,
      redirectTo: window.location.origin,
    });
    setLinkLoading(false);
    if (data.error) {
      toast.error('Erro ao gerar link', { description: data.error });
      setLinkDialog(false);
    } else {
      setRecoveryLink(data.link);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(recoveryLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container py-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Gerenciar Usuários</h1>
              <p className="text-sm text-muted-foreground">Altere senhas e gerencie acessos</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchUsers} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button size="sm" className="gap-2" onClick={() => { setNewEmail(''); setNewPassword(''); setNewUserDialog(true); }}>
              <UserPlus className="h-4 w-4" />
              Novo usuário
            </Button>
          </div>
        </div>
      </motion.div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{users.length} usuário(s)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-center text-muted-foreground py-12 text-sm">Nenhum usuário encontrado</p>
          ) : (
            <div className="divide-y">
              {users.map(user => (
                <div key={user.id} className="px-6 py-4 flex items-center gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Criado em {format(new Date(user.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      {user.last_sign_in_at && (
                        <> · Último acesso {format(new Date(user.last_sign_in_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={() => openPwDialog(user)}
                    >
                      <KeyRound className="h-3 w-3" />
                      Alterar senha
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1 text-muted-foreground"
                      onClick={() => handleGenerateLink(user)}
                    >
                      Gerar link
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog: alterar senha */}
      <Dialog open={pwDialog} onOpenChange={setPwDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar senha</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">{selectedUser?.email}</p>
            <div className="space-y-1">
              <Label>Nova senha</Label>
              <Input
                type="password"
                placeholder="mínimo 6 caracteres"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleUpdatePassword()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPwDialog(false)}>Cancelar</Button>
            <Button onClick={handleUpdatePassword} disabled={pwLoading}>
              {pwLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: link de recuperação */}
      <Dialog open={linkDialog} onOpenChange={setLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link de redefinição de senha</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Envie este link para <strong>{selectedUser?.email}</strong>. Ele permite definir uma nova
              senha sem precisar de e-mail. Válido por 1 hora.
            </p>
            {linkLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </div>
            ) : (
              <div className="flex gap-2">
                <Input readOnly value={recoveryLink} className="text-xs font-mono" />
                <Button size="icon" variant="outline" onClick={copyLink}>
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setLinkDialog(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: novo usuário */}
      <Dialog open={newUserDialog} onOpenChange={setNewUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar novo usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>E-mail</Label>
              <Input
                type="email"
                placeholder="usuario@exemplo.com"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Senha inicial</Label>
              <Input
                type="password"
                placeholder="mínimo 6 caracteres"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreateUser()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewUserDialog(false)}>Cancelar</Button>
            <Button onClick={handleCreateUser} disabled={newUserLoading}>
              {newUserLoading ? 'Criando...' : 'Criar usuário'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
