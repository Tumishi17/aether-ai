CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX chat_messages_session_created_idx ON public.chat_messages (session_id, created_at);

GRANT SELECT, INSERT, DELETE ON public.chat_messages TO anon;
GRANT SELECT, INSERT, DELETE ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read chat messages" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Anyone can add chat messages" ON public.chat_messages FOR INSERT WITH CHECK (char_length(content) <= 20000 AND char_length(session_id) BETWEEN 8 AND 64);
CREATE POLICY "Anyone can clear chat messages" ON public.chat_messages FOR DELETE USING (true);