
-- Create categories table
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY, -- Unique ID for each main category (auto-incrementing)
    category_name VARCHAR(100) UNIQUE NOT NULL, -- Name of the main category (e.g., 'Electronics')
    description TEXT, -- Optional: A longer description of the category
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Optional: Timestamp of creation
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP -- Optional: Timestamp of last update
);

-- Create sub_categories table
CREATE TABLE sub_categories (
    sub_category_id SERIAL PRIMARY KEY, -- Unique ID for each sub-category (auto-incrementing)
    category_id INT NOT NULL,           -- Foreign key linking to the parent category
    sub_category_name VARCHAR(100) NOT NULL, -- Name of the sub-category (e.g., 'Smartphones')
    description TEXT, -- Optional: A longer description of the sub-category
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Define the foreign key constraint
    CONSTRAINT fk_parent_category
        FOREIGN KEY (category_id)
        REFERENCES categories (category_id)
        ON DELETE RESTRICT    -- Prevent deleting a category if sub-categories still exist
        ON UPDATE CASCADE,    -- If a category_id in 'categories' changes, update it here

    -- Ensure sub_category_name is unique *within* its parent category
    CONSTRAINT uq_sub_category_name_per_category
        UNIQUE (category_id, sub_category_name)
);

-- Create indexes for better performance
CREATE INDEX idx_sub_categories_category_id ON sub_categories (category_id);

-- Insert some sample data to populate the tables
INSERT INTO categories (category_name, description) VALUES
    ('Beauty Services', 'Professional beauty and wellness services'),
    ('Hair Care', 'Hair styling, cutting, and treatment services'),
    ('Skin Care', 'Facial treatments and skin care services'),
    ('Nail Care', 'Manicure, pedicure, and nail art services'),
    ('Makeup', 'Professional makeup and styling services'),
    ('Wellness', 'Health and wellness related services');

INSERT INTO sub_categories (category_id, sub_category_name, description) VALUES
    (1, 'Bridal Services', 'Complete bridal beauty packages'),
    (1, 'Party Makeup', 'Special occasion makeup services'),
    (2, 'Hair Cutting', 'Professional hair cutting services'),
    (2, 'Hair Styling', 'Hair styling and blowdry services'),
    (2, 'Hair Coloring', 'Hair dyeing and highlighting services'),
    (3, 'Facial Treatment', 'Deep cleansing and rejuvenating facials'),
    (3, 'Anti-Aging', 'Anti-aging skin treatments'),
    (4, 'Manicure', 'Hand and nail care services'),
    (4, 'Pedicure', 'Foot and nail care services'),
    (4, 'Nail Art', 'Creative nail design services'),
    (5, 'Party Makeup', 'Special event makeup'),
    (5, 'Bridal Makeup', 'Wedding day makeup services'),
    (6, 'Massage Therapy', 'Relaxation and therapeutic massage'),
    (6, 'Spa Treatments', 'Full body spa and wellness treatments');
