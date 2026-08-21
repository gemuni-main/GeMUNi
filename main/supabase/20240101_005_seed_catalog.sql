-- Migration 005: Catalog seed data

insert into public.catalog_countries (id, name, iso_code, flag_emoji) values
  ('us', 'United States', 'US', '🇺🇸'),
  ('uk', 'United Kingdom', 'GB', '🇬🇧'),
  ('cn', 'China', 'CN', '🇨🇳'),
  ('ru', 'Russia', 'RU', '🇷🇺'),
  ('fr', 'France', 'FR', '🇫🇷'),
  ('de', 'Germany', 'DE', '🇩🇪'),
  ('jp', 'Japan', 'JP', '🇯🇵'),
  ('br', 'Brazil', 'BR', '🇧🇷'),
  ('in', 'India', 'IN', '🇮🇳'),
  ('ca', 'Canada', 'CA', '🇨🇦')
on conflict (id) do nothing;

insert into public.catalog_committees (id, name, acronym, description, difficulty) values
  ('unsc', 'Security Council', 'UNSC', 'Maintains international peace and security; 15 members with binding resolution power.', 'advanced'),
  ('unga', 'General Assembly', 'UNGA', 'Deliberative body of all UN member states; issues non-binding resolutions.', 'beginner'),
  ('unhrc', 'Human Rights Council', 'UNHRC', 'Promotes and protects human rights globally through investigations and resolutions.', 'intermediate'),
  ('who', 'World Health Organization', 'WHO', 'Directing and coordinating authority on international public health.', 'intermediate'),
  ('unep', 'UN Environment Programme', 'UNEP', 'Sets the global environmental agenda and promotes sustainable development.', 'intermediate'),
  ('icj', 'International Court of Justice', 'ICJ', 'Principal judicial organ of the United Nations.', 'advanced'),
  ('ecosoc', 'Economic and Social Council', 'ECOSOC', 'Coordinates the economic and social work of UN specialized agencies.', 'beginner'),
  ('unicef', 'UN Children''s Fund', 'UNICEF', 'Provides humanitarian and developmental aid to children worldwide.', 'beginner')
on conflict (id) do nothing;

insert into public.catalog_agendas (id, title, description, committee_id, compatibility) values
  ('climate-migration', 'Climate Migration', 'Managing displacement and migration driven by climate change.', null, '["unsc","unga","unhrc"]'),
  ('digital-privacy', 'Digital Privacy', 'Protecting privacy rights in the digital age across borders.', null, '["unga","unhrc"]'),
  ('water-scarcity', 'Water Scarcity', 'Addressing global freshwater scarcity and transboundary water management.', null, '["unga","unep"]'),
  ('arms-control', 'Arms Control', 'Regulating conventional and unconventional arms proliferation.', null, '["unsc"]'),
  ('pandemic-preparedness', 'Pandemic Preparedness', 'Global health emergency preparedness, response, and equity.', null, '["who","unga"]'),
  ('space-security', 'Space Security', 'Preventing an arms race in outer space and governing orbital activity.', null, '["unga","unsc"]'),
  ('ocean-plastics', 'Ocean Plastic Pollution', 'Reducing marine plastic pollution and protecting ocean ecosystems.', null, '[''unep'',"unga"]'),
  ('ai-governance', 'Artificial Intelligence Governance', 'International governance frameworks for AI development and deployment.', null, '["unga","unhrc"]')
on conflict (id) do nothing;