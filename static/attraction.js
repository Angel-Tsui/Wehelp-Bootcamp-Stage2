let fullLink= window.location.href;
let identifier = "3000/"

let index = fullLink.indexOf(identifier);
let length = identifier.length;

let src = fullLink.slice(index + length);
src = "/api/" + src
// console.log(src)
fetch(src)
    .then((result) => {
        return result.json()
    })
    .then((response) => {
        // console.log(response)
        data = response["data"];

        // console.log(data["name"], data["category"], data["mrt"])

        let totalImgCount = 0;
        for(i=0;i<data["images"].length;i++){
            const display_gallery = document.querySelector(".detail__display--gallery");
            const display_gallery_img = document.createElement("img");
            display_gallery_img.src = data["images"][i];
            display_gallery_img.className = "detail__display--gallery_img";
            display_gallery_img.id = /*"display_gallery_img" + */ [i]
            display_gallery.appendChild(display_gallery_img)
            // console.log(data["images"][i])
            const slider = document.querySelector(".slider");
            const slider_btn_lable = document.createElement("label");
            slider_btn_lable.className = "slider_manual_btn";
            slider.appendChild(slider_btn_lable);
            const slider_btn = document.createElement("input");
            slider_btn.name = "slider_btn";
            slider_btn.id = "slider_btn" + [i];
            slider_btn_lable.appendChild(slider_btn)
            totalImgCount += 1;
            // console.log(display_gallery_img.id)
            // console.log(slider_btn.id)
        }
    
        // slider on left / right arrow click only
        let count = 0
        // console.log(count)
        // const display_gallery_img = document.querySelectorAll(".detail__display--gallery_img");
        let slider_btns = document.querySelectorAll(".slider_manual_btn");
        slider_btns[count].classList.add('active');

        const display_leftClick = document.querySelector(".detail__display--leftClick");
        const display_gallery = document.querySelector(".detail__display--gallery");
        const display_rightClick = document.querySelector(".detail__display--rightClick");
        totalImgCount = totalImgCount - 1;
        display_rightClick.addEventListener("click", function(){
            // console.log("right")
            display_gallery.scrollLeft += display_gallery.offsetWidth;
            count += 1;
            // console.log(count, totalImgCount);
            
            if (count <= totalImgCount){
                slider_btns.forEach((btn) => {
                btn.classList.remove('active');
            })

            slider_btns[count].classList.add('active');
            }
            else{
                count = totalImgCount
            }
            
        })

        display_leftClick.addEventListener("click", function(){
            // console.log("left")
            display_gallery.scrollLeft -= display_gallery.offsetWidth;
            count -= 1;
            // console.log(count);
            
            if (count >= 0){
                slider_btns.forEach((btn) => {
                btn.classList.remove('active');
            })

            slider_btns[count].classList.add('active');
            }
            else{
                count = 0
            }
        })

        // datepicker format

        // day or night selection and pricing
        let radioSelect = document.querySelectorAll("input[name='dorn']")
        let chosen = document.querySelector(".booking--form--price span")
        let day = document.querySelector("#day");
        let night = document.querySelector("#night");
        radioSelect.forEach(radioSelect => {
            radioSelect.addEventListener("change", function(){
                selected = document.querySelector("input[name='dorn']:checked").value;
                // console.log(selected);
                if(selected == "d"){
                    day.src="/static/images/radiobtn_green.png"
                    night.src="/static/images/radiobtn_white.png"
                    chosen.innerText="新台幣2000元"
                }else{
                    day.src="/static/images/radiobtn_white.png"
                    night.src="/static/images/radiobtn_green.png"
                    chosen.innerText="新台幣2500元"
                }
                
            })
        })

        const profile_title = document.querySelector(".detail__display--profile--title")
        profile_title.innerText = data["name"];

        const profile_short = document.querySelector(".detail__display--profile--short")
        profile_short.innerText = data["mrt"] + " 的 " + data["category"];

        const intro_description = document.querySelector(".detail__intro--description");
        intro_description.innerText = data["description"];

        const location_content = document.querySelector(".detail__intro--location--content");
        location_content.innerText = data["address"];

        const transport_content = document.querySelector(".detail__intro--transport--content");
        transport_content.innerText = data["transport"];
    })
