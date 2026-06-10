import os
from PIL import Image

logo_path = os.path.join("public", "LaHustle-Original.png")

splash_sizes = [
    (1290, 2796),
    (1179, 2556),
    (1125, 2436),
    (1242, 2688),
    (828, 1792),
    (750, 1334),
    (2048, 2732),
    (1668, 2388),
    (2732, 2732),
    (640, 1136)
]

def generate():
    print(f"Loading logo from: {logo_path}")
    logo = Image.open(logo_path)
    
    for width, height in splash_sizes:
        print(f"Generating splash {width}x{height}...")
        
        # Create solid background #050505
        background = Image.new("RGBA", (width, height), (5, 5, 5, 255))
        
        # Calculate new logo size (60% of screen width)
        target_width = int(width * 0.60)
        aspect_ratio = logo.height / logo.width
        target_height = int(target_width * aspect_ratio)
        
        # Resize logo using high-quality resampling
        resized_logo = logo.resize((target_width, target_height), Image.Resampling.LANCZOS)
        
        # Center logo
        x = (width - target_width) // 2
        y = (height - target_height) // 2
        
        # Paste logo using alpha channel as mask if logo has alpha
        if resized_logo.mode in ('RGBA', 'LA') or (resized_logo.mode == 'P' and 'transparency' in resized_logo.info):
            background.paste(resized_logo, (x, y), resized_logo)
        else:
            background.paste(resized_logo, (x, y))
            
        output_path = os.path.join("public", f"splash-{width}x{height}.png")
        background.convert("RGB").save(output_path, "PNG")
        print(f"Saved: {output_path}")
        
    print("All splash screens generated successfully!")

if __name__ == "__main__":
    generate()
