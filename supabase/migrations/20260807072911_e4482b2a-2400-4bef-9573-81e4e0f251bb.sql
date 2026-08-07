DROP POLICY IF EXISTS "Anyone can read chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can add chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can clear chat messages" ON public.chat_messages;
REVOKE ALL ON public.chat_messages FROM anon;
REVOKE ALL ON public.chat_messages FROM authenticated;
GRANT ALL ON public.chat_messages TO service_role;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;