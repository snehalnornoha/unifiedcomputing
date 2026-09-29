import "./upload_cloth.css";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import imageCompression from "browser-image-compression";
import { refrsh_jwt_token } from "./controlers";
const API_URL = import.meta.env.VITE_API_URL;

const datafields = {
  name: "",
  category: "",
  subCategory: "",
  brand: "",
  size: "",
  gender: "",
  color: "",
  material: "",
  condition: "",
  worn: "",
  defects: "",
  description: "",
  swapCategories: [],
  swapSize: "",
  estimatedValue: "",
  Country :"",
  State:"",
  PIN:"",
  
};

const options = {
  maxSizeMB: 1,             // Maximum size
  maxWidthOrHeight: 1920,   // Resize large images
  useWebWorker: true,       // Compress in a Web Worker
  initialQuality: 0.8,      // JPEG/WebP quality
};


 function UploadClothing() {
  const {register,handleSubmit,formState: { errors, isSubmitting },} = useForm({
                                                                          defaultValues: datafields,
                                                                        });

  const navi = useNavigate()

  const [images, setImages] = useState([]);
  const [isimgstsfd , setIsimgstsfd ] = useState(false)

  // Image upload
const handleImages = (e) => {
    const files = Array.from(e.target.files);

    if (images.length + files.length > 3) {
        alert("exact 3 images is needed");
        
    }else{
       setImages(prev => [...prev, ...files]);
    }
    if(images.length === 3){
      setIsimgstsfd(true)
    }

   
};

  // Form submit
  const onSubmit = async (data) => {
    console.log(images.length,!images.length === 3)
    if(!(images.length === 3)){alert(`Selected image must be exactly 3 you selected ${images.length}`);return}
    console.log("Form Data:", Object.entries(data));
    console.log("Images:", images);
    
    const form_data = new FormData()
    // Add normal form fields
  Object.entries(data).forEach(([key, value]) => {
    form_data.append(key, value);
  });



    const up_fun_cloth = async(is_refresh)=>{
        try {
                  // Add compressed images to the formdata
                  for(const image of images){
                    const compressed = await imageCompression(image, options);
                    form_data.append("images",compressed );
                  };

          
                const res = await fetch(
                  `${API_URL}/protectedApi/cloth_upload`,
                  {
                    method: "POST",
                    credentials: "include",
                    body: form_data
                  }
                );
                console.log(res.ok)
                if(res.ok){
                  const body = await res.json();
                  navi("/myList")
                }
                else if (res.status === 401 && is_refresh) {
                    const refreshed = await refrsh_jwt_token();
        
                    if (refreshed.success) {
                        console.log("hi token rfreshed ")
                        return up_fun_cloth(false);
                    }
                }
                
                else{
                throw new Error("something went wrong please retry again")
                }
                }
              catch (error) {
              console.error(error);
              alert(error)
              }
        }
    await up_fun_cloth(true)
    
  };

  return (
    <div className="upload-page">
      <h1>Upload Clothing</h1>

      <p style={{ color: "black" }}>
        Add an item that you want to swap.
      </p>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* PHOTOS */}
        <div className="form-section">
          <h2>Photos</h2>

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImages}
          />

          {isimgstsfd ? <p>Condition Setisfied</p> :<p className="error">Upload 3 clear photos</p>}
          

          {images.length > 0 ? 
            <p>{images.length} image(s) selected</p>:<p className="error">{images.length} image(s) selected for upload</p>
          }
        </div>

        <div className="form-section">
          <h2>Location Information</h2>
          <label >Country</label>
          <input
            type="text"
            placeholder="enter the valid country name  "
            {...register("Country", {
              required: "Country name is required",
            })}
          />

          {errors.Country && (
            <p className="error">{errors.Country.message}</p>
          )}
          <label >State</label>
          <input
            type="text"
            placeholder="enter the valid state name "
            {...register("State", {
              required: "State is required",
            })}
          />

          {errors.State && (
            <p className="error">{errors.State.message}</p>
          )}
          <label >Postal PIN</label>
          <input
            type="text"
            placeholder="please enter the valid pin"
            {...register("PIN", {
              required: "postal PIN is required", 
            })}
          />

          {errors.PIN && (
            <p className="error">{errors.PIN.message}</p>
          )}


        </div>

        {/* BASIC INFORMATION */}
        <div className="form-section">
          <h2>Basic Information</h2>

          {/*  Name */}
          <label> Name</label>

          <input
            type="text"
            placeholder="e.g. Black Oversized T-Shirt"
            {...register("name", {
              required: "Name is required",
            })}
          />

          {errors.name && (
            <p className="error">{errors.name.message}</p>
          )}

          {/* Category */}
          <label htmlFor="category">Category</label>

          <input
            type="text"
            id="category"
            list="category-list"
            className="h-input"
            placeholder="Select or type category"
            {...register("category", {
              required: "Category is required",
            })}
          />

          {errors.category && (
            <p className="error">{errors.category.message}</p>
          )}

          <datalist id="category-list">
            <option value="T-Shirt" />
            <option value="Shirt" />
            <option value="Jeans" />
            <option value="Trousers" />
            <option value="Shorts" />
            <option value="Jacket" />
            <option value="Hoodie" />
            <option value="Sweater" />
            <option value="Dress" />
            <option value="Skirt" />
            <option value="Saree" />
            <option value="Kurta" />
            <option value="Other" />
          </datalist>

          {/* Sub Category */}
          <label>Sub Category</label>

          <input
            type="text"
            placeholder="e.g. Oversized"
            {...register("subCategory",{
              required : " Sub catgory is required..",
            })}
          />

          {errors.subCategory && 
          <p className="error">{errors.subCategory.message}</p>
          
          }

          {/* Brand */}
          <label htmlFor="brand">Brand</label>

          <input
            type="text"
            id="brand"
            list="brand-list"
            className="h-input"
            placeholder="Select or type brand"
            {...register("brand" ,{
              required  : "Clothing brand is rquired..",
            })}
          />

          <datalist id="brand-list">
            <option value="Nike" />
            <option value="Adidas" />
            <option value="H&M" />
            <option value="Zara" />
            <option value="Levi's" />
            <option value="Uniqlo" />
            <option value="Puma" />
            <option value="Reebok" />
            <option value="Gucci" />
            <option value="Louis Vuitton" />
            <option value="Calvin Klein" />
            <option value="Tommy Hilfiger" />
            <option value="Allen Solly" />
            <option value="Peter England" />
            <option value="Other" />
          </datalist>


          {errors.brand &&
          <p className="error">{errors.brand.message}</p> 
          } 


        </div>

        
        {/* CLOTHING DETAILS */}
        <div className="form-section">
          <h2>Clothing Details</h2>

          {/* Gender */}
          <label>Gender</label>

          <select
            {...register("gender", {
              required: "Please select a gender",
            })}
          >
            <option value="">Select</option>
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Unisex">Unisex</option>
          </select>

          {errors.gender && (
            <p className="error">{errors.gender.message}</p>
          )}

          {/* Size */}
          <label>Size</label>

          <select
            {...register("size", {
              required: "Please select a size",
            })}
          >
            <option value="">Select size</option>
            <option value="XS">XS</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
            <option value="XXL">XXL</option>
            <option value="XXXL">XXXL</option>
          </select>

          {errors.size && (
            <p className="error">{errors.size.message}</p>
          )}

          {/* Color */}
          <label>Color</label>

          <input
            type="text"
            placeholder="e.g. Black"
            {...register("color" , {
              required :"Please enter the given field",
            })}
          />
           {errors.color &&
        <p className="error">{errors.color.message}</p>
        }

          {/* Material */}
          <label>Material</label>

          <select {...register("material", {
            required:"Material is required",
          })}>
            <option value="">Select material</option>
            <option value="Cotton">Cotton</option>
            <option value="Polyester">Polyester</option>
            <option value="Denim">Denim</option>
            <option value="Wool">Wool</option>
            <option value="Linen">Linen</option>
            <option value="Silk">Silk</option>
            <option value="Other">Other</option>
          </select>

          {errors.material &&
          <p className="error">{errors.material.message}</p>
          }
        </div>
        

        {/* CONDITION */}
        <div className="form-section">
          <h2>Condition</h2>

          {/* Condition */}
          <label>Condition</label>

          <select
            {...register("condition", {
              required: "Please select the condition",
            })}
          >
            <option value="">Select condition</option>
            <option value="Brand New">Brand New</option>
            <option value="Like New">Like New</option>
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
          </select>

          {errors.condition && (
            <p className="error">{errors.condition.message}</p>
          )}

          {/* Worn */}
          <label>How many times have you worn it?</label>

          <select {...register("worn",{
            required: " Please enter this field",
          })}>
            <option value="">Select</option>
            <option value="Never">Never</option>
            <option value="1–3 times">1–3 times</option>
            <option value="4–10 times">4–10 times</option>
            <option value="10+ times">10+ times</option>
          </select>
          {errors.worn && 
          <p className="error">{errors.worn.message}</p>
          }

          {/* Defects */}
          <label>Any defects?</label>

          <select {...register("defects",{
            required: " Please enter this deffects field",
          })}>
            <option value="">Select</option>
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
          {errors.defects && 
          <p className="error">{errors.defects.message}</p>
          }
        </div>
          


        {/* DESCRIPTION */}
        <div className="form-section">
          <h2>Description</h2>

          <textarea
            placeholder="Describe your clothing..."
            rows="5"
            {...register("description")}
          />
        </div>

        {/* SWAP PREFERENCES */}
        <div className="form-section">
          <h2>Swap Preferences</h2>

          <label>What are you looking for?</label>

          <div>
            <label>
              <input
                type="checkbox"
                value="T-Shirt"
                {...register("swapCategories")}
              />
              T-Shirts
            </label>

            <label>
              <input
                type="checkbox"
                value="Hoodie"
                {...register("swapCategories")}
              />
              Hoodies
            </label>

            <label>
              <input
                type="checkbox"
                value="Jeans"
                {...register("swapCategories")}
              />
              Jeans
            </label>

            <label>
              <input
                type="checkbox"
                value="Jacket"
                {...register("swapCategories")}
              />
              Jackets
            </label>

            <label>
              <input
                type="checkbox"
                value="Dress"
                {...register("swapCategories")}
              />
              Dresses
            </label>
          </div>

          {/* Preferred Size */}
          <label>Preferred Size</label>

          <select {...register("swapSize" , {
            required : "Enter Preferred Size"
          })}>
            <option value="">Any size</option>
            <option value="XS">XS</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
            <option value="XXL">XXL</option>
          </select>
          {errors.swapSize && 
          <p className="error">{errors.swapSize.message}</p>
          }

          {/* Estimated Value */}
          <label>Estimated Value ₹</label>

          <input
            type="number"
            placeholder="800"
            {...register("estimatedValue", {
              required:"Please enter the value",
              min: {
                value: 0,
                message: "Value cannot be negative",
              },
            })}
          />

          {errors.estimatedValue && (
            <p className="error">
              {errors.estimatedValue.message}
            </p>
          )}
        </div>

        {/* SUBMIT */}
        <button
          className="smbt-btn"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Publishing..." : "Publish Clothing"}
        </button>
      </form>
    </div>
  );
}

export default UploadClothing;