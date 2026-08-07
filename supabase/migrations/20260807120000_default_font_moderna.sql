-- Troca a tipografia padrão de serifada (cormorant) para moderna sem serifa
-- (Manrope + Inter), a pedido do time de produto. Clínicas que já tinham
-- escolhido um par de fonte explicitamente continuam com a escolha delas.
ALTER TABLE public.clinics
  ALTER COLUMN font_pair SET DEFAULT 'moderna';

UPDATE public.clinics
  SET font_pair = 'moderna'
  WHERE font_pair = 'cormorant';
