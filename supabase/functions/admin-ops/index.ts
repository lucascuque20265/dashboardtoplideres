import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Verifica se o chamador está autenticado
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return Response.json({ error: 'Não autorizado' }, { status: 401, headers: corsHeaders })
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(
    authHeader.replace('Bearer ', ''),
  )
  if (authError || !caller) {
    return Response.json({ error: 'Não autorizado' }, { status: 401, headers: corsHeaders })
  }

  const body = await req.json()
  const { action } = body

  // Listar usuários
  if (action === 'list_users') {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 200 })
    if (error) return Response.json({ error: error.message }, { status: 400, headers: corsHeaders })
    return Response.json({ users: data.users }, { headers: corsHeaders })
  }

  // Alterar senha diretamente
  if (action === 'update_password') {
    const { userId, password } = body
    if (!userId || !password) {
      return Response.json({ error: 'userId e password são obrigatórios' }, { status: 400, headers: corsHeaders })
    }
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, { password })
    if (error) return Response.json({ error: error.message }, { status: 400, headers: corsHeaders })
    return Response.json({ success: true }, { headers: corsHeaders })
  }

  // Gerar link de recuperação de senha (sem enviar e-mail)
  if (action === 'generate_recovery_link') {
    const { email, redirectTo } = body
    if (!email) {
      return Response.json({ error: 'email é obrigatório' }, { status: 400, headers: corsHeaders })
    }
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: { redirectTo: redirectTo ?? Deno.env.get('SITE_URL') ?? '' },
    })
    if (error) return Response.json({ error: error.message }, { status: 400, headers: corsHeaders })
    return Response.json({ link: data.properties?.action_link }, { headers: corsHeaders })
  }

  return Response.json({ error: 'Ação inválida' }, { status: 400, headers: corsHeaders })
})
