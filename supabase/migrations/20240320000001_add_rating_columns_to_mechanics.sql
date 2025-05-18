-- Add rating columns to mechanics table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'mechanics' AND column_name = 'average_rating') THEN
        ALTER TABLE public.mechanics 
        ADD COLUMN average_rating DECIMAL(3,2) DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'mechanics' AND column_name = 'review_count') THEN
        ALTER TABLE public.mechanics 
        ADD COLUMN review_count INTEGER DEFAULT 0;
    END IF;
END $$; 