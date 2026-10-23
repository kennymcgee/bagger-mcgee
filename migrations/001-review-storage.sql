CREATE TABLE IF NOT EXISTS public.review_packets (
 id text PRIMARY KEY CHECK (id ~ '^[a-f0-9]{64}$'),
 packet jsonb NOT NULL CHECK (jsonb_typeof(packet) = 'object' AND packet->>'packetId' = id),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.review_items (
 id text PRIMARY KEY CHECK (id ~ '^[a-f0-9]{64}:[0-9]{1,5}$'),
 packet_id text NOT NULL REFERENCES public.review_packets(id),
 card jsonb NOT NULL CHECK (jsonb_typeof(card) = 'object' AND card->>'id' = id),
 CHECK (split_part(id, ':', 1) = packet_id)
);
CREATE TABLE IF NOT EXISTS public.review_events (
 item_id text NOT NULL REFERENCES public.review_items(id),
 revision integer NOT NULL CHECK (revision BETWEEN 1 AND 1000),
 event jsonb NOT NULL CHECK (jsonb_typeof(event) = 'object' AND (event->>'revision')::integer = revision),
 recorded_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY (item_id, revision)
);
ALTER TABLE public.review_packets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.review_packets, public.review_items, public.review_events FROM PUBLIC, anon, authenticated;
CREATE OR REPLACE FUNCTION public.reject_review_mutation() RETURNS trigger LANGUAGE plpgsql SET search_path = pg_catalog AS $$
BEGIN RAISE EXCEPTION 'Review records are append-only'; END;
$$;
REVOKE ALL ON FUNCTION public.reject_review_mutation() FROM PUBLIC;
DROP TRIGGER IF EXISTS review_packets_immutable ON public.review_packets;
CREATE TRIGGER review_packets_immutable BEFORE UPDATE OR DELETE ON public.review_packets FOR EACH ROW EXECUTE FUNCTION public.reject_review_mutation();
DROP TRIGGER IF EXISTS review_items_immutable ON public.review_items;
CREATE TRIGGER review_items_immutable BEFORE UPDATE OR DELETE ON public.review_items FOR EACH ROW EXECUTE FUNCTION public.reject_review_mutation();
DROP TRIGGER IF EXISTS review_events_immutable ON public.review_events;
CREATE TRIGGER review_events_immutable BEFORE UPDATE OR DELETE ON public.review_events FOR EACH ROW EXECUTE FUNCTION public.reject_review_mutation();
