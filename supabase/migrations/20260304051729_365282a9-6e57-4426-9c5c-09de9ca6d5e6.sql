-- Storage policies for brainrot-flags bucket
CREATE POLICY "Admins can upload flags" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'brainrot-flags' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update flags" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'brainrot-flags' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete flags" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'brainrot-flags' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can view flags storage" ON storage.objects FOR SELECT USING (bucket_id = 'brainrot-flags');