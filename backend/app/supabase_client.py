import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

if url and key:
    supabase: Client = create_client(url, key)
else:
    supabase = None

async def upload_to_storage(bucket_name: str, file_path: str, destination_path: str, content_type: str = None) -> bool:
    if not supabase:
        print("Supabase client not initialized.")
        return False
        
    try:
        with open(file_path, 'rb') as f:
            file_data = f.read()
            
        opts = {}
        if content_type:
            opts["content-type"] = content_type
            
        # Ensure bucket exists (or fail gracefully if not permissions are given)
        # Uploading file to the specified bucket
        res = supabase.storage.from_(bucket_name).upload(
            file=file_data,
            path=destination_path,
            file_options=opts
        )
        return True
    except Exception as e:
        print(f"Error uploading to Supabase Storage ({bucket_name}): {str(e)}")
        return False

def get_public_url(bucket_name: str, file_path: str) -> str:
    if not supabase:
        return ""
    try:
        res = supabase.storage.from_(bucket_name).get_public_url(file_path)
        return res
    except Exception as e:
        print(f"Error getting public URL: {str(e)}")
        return ""

def get_signed_url(bucket_name: str, file_path: str, expires_in: int = 3600) -> str:
    if not supabase:
        return ""
    try:
        res = supabase.storage.from_(bucket_name).create_signed_url(file_path, expires_in)
        return res.get('signedURL', '')
    except Exception as e:
        print(f"Error getting signed URL: {str(e)}")
        return ""
