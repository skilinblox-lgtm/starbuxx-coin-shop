
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_key TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage email templates" ON public.email_templates FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can view active templates" ON public.email_templates FOR SELECT USING (active = true);

CREATE TABLE public.email_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_key TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  recipient_user_id UUID,
  order_id UUID REFERENCES public.orders(id),
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage email logs" ON public.email_logs FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Insert default templates
INSERT INTO public.email_templates (template_key, subject, body_html, description) VALUES
('payment_approved', 'StarBuxx - Pagamento Aprovado! ✅', '<h1>Pagamento Confirmado!</h1><p>Olá {{nome}},</p><p>Seu pagamento do pedido <strong>#{{pedido_id}}</strong> foi aprovado com sucesso!</p><p>Valor: <strong>R$ {{valor}}</strong></p><p>Nosso time já foi notificado e a entrega será iniciada em breve.</p><p>Acompanhe seu pedido em: <a href="{{link_pedido}}">Meus Pedidos</a></p><p>Equipe StarBuxx</p>', 'Enviado quando o pagamento do pedido é confirmado'),
('awaiting_payment', 'StarBuxx - Pedido Criado - Aguardando Pagamento 💳', '<h1>Pedido Criado!</h1><p>Olá {{nome}},</p><p>Seu pedido <strong>#{{pedido_id}}</strong> foi criado com sucesso.</p><p>Valor: <strong>R$ {{valor}}</strong></p><p>Método: <strong>{{metodo_pagamento}}</strong></p><p>Realize o pagamento para que possamos iniciar a entrega.</p><p>Equipe StarBuxx</p>', 'Enviado quando um novo pedido é criado'),
('order_delivered', 'StarBuxx - Pedido Entregue! 🎮', '<h1>Entrega Concluída!</h1><p>Olá {{nome}},</p><p>Seu pedido <strong>#{{pedido_id}}</strong> foi entregue com sucesso!</p><p>Esperamos que aproveite seus itens. Se tiver qualquer problema, entre em contato pelo nosso Discord.</p><p>Não esqueça de deixar sua avaliação!</p><p>Equipe StarBuxx</p>', 'Enviado quando o pedido é marcado como entregue'),
('order_cancelled', 'StarBuxx - Pedido Cancelado ❌', '<h1>Pedido Cancelado</h1><p>Olá {{nome}},</p><p>Infelizmente seu pedido <strong>#{{pedido_id}}</strong> foi cancelado.</p><p>Se você realizou algum pagamento, o reembolso será processado automaticamente.</p><p>Caso tenha dúvidas, entre em contato pelo Discord.</p><p>Equipe StarBuxx</p>', 'Enviado quando o pedido é cancelado'),
('password_recovery', 'StarBuxx - Recuperação de Senha 🔐', '<h1>Recuperação de Senha</h1><p>Olá,</p><p>Você solicitou a recuperação da sua senha na StarBuxx.</p><p>Clique no link abaixo para redefinir sua senha:</p><p><a href="{{link_recuperacao}}">Redefinir Senha</a></p><p>Se você não solicitou esta alteração, ignore este e-mail.</p><p>Equipe StarBuxx</p>', 'Enviado quando o usuário solicita recuperação de senha');
