import { supabase } from "@/integrations/supabase/client";

export const uploadFileToSupabase = async (
	file: File,
	bucket: string,
	folder: string = ''
): Promise<string | null> => {
	try {
		const fileExt = file.name.split('.').pop();
		const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
		const filePath = folder ? `${folder}/${fileName}` : fileName;

		const { error: uploadError } = await supabase.storage
			.from(bucket)
			.upload(filePath, file);

		if (uploadError) {
			console.error('Error uploading file:', uploadError);
			return null;
		}

		const { data } = supabase.storage
			.from(bucket)
			.getPublicUrl(filePath);

		return data.publicUrl;
	} catch (error) {
		console.error('Unexpected error uploading file:', error);
		return null;
	}
};
