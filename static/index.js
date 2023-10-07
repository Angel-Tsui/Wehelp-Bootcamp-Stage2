// 載入初始網頁的程式
m();
let page=0;
let keyword = "";
// console.log("launch page")
load();
// console.log("loading")

// 功能開發
// 生成捷運站列表
function m(){
    fetch("/api/mrts")
        .then(function(receive){
            return receive.json();
        }).then(function(mrt){
            let mrts=mrt["data"];

            let s=0;
            more();

            let itemlist = document.querySelector(".main__mrt ul")
            let leftarrow = document.querySelector(".main__mrt--left")
            let rightarrow = document.querySelector(".main__mrt--right")

            // 載入更多捷運站
            rightarrow.addEventListener("click", function(){
                more();
                let w = window.innerWidth;
                if(w <= 640){
                    itemlist.scrollLeft += 200;
                }else if(w <= 1200){
                    itemlist.scrollLeft += 500;
                }else{
                    itemlist.scrollLeft += 1000;
                }
                // console.log("scroll width: ",itemlist.scrollWidth);
                // console.log("client width: ", itemlist.scrollWidth);
            });

            leftarrow.addEventListener("click", function(){
                let w = window.innerWidth;
                if(w <= 640){
                    itemlist.scrollLeft -= 200;
                }else if(w <= 1200){
                    itemlist.scrollLeft -= 500;
                }else{
                    itemlist.scrollLeft -= 1000;
                }
                // console.log("scroll width: ", itemlist.scrollWidth);
                // console.log("client width: ", itemlist.clientWidth);
            });

            // 點擊左右按鈕載入更多捷運站
            function more(){
                let dis = parseInt((mrts.length / 2) + 1);
                let e = s + dis;
                let r = mrts.length-1 - e;
                if(s==0){
                    let r = mrts.length-1 - e;
                }
                else if(r+dis < dis){
                    e=mrts.length;
                }
                else{
                    e=mrts.length-1;
                }

                for(k=s;k<e;k++){
                    let list=document.querySelector(".main__mrt--middle");
                    const e_mrt=document.createElement("li");
                    e_mrt.innerText=mrts[k];
                    e_mrt.onclick = function(){
                        let clicked_mrt=e_mrt.innerText
                        // console.log(clicked_mrt);
                        let getkeyword=document.querySelector("#keyword");
                        getkeyword.value=clicked_mrt;
                        let query=document.querySelector(".banner_word--search--buttonicon");
                        query.click();
                    };
                    e_mrt.className=".main__mrt ul li";
                    list.appendChild(e_mrt);
                }
                s+=dis;
            }
        })       
}

// Infinite Scrolling 功能
const intersectionObserver = new IntersectionObserver(entries => {
    // If intersectionRatio is 0, the button is out of view and we do not need to load anything more
    if (entries[0].isIntersecting == false){
        return
    }
    // console.log("stop observe")
    intersectionObserver.unobserve(document.querySelector(".footer"))
    // console.log("stop observe 2")
    // console.log("observe and load")
    load();
}, {
    rootMargin:"100px",
})

// keyword 搜尋功能
let form=document.querySelector("#form");
form.addEventListener("submit", function (res){
    res.preventDefault();
    intersectionObserver.unobserve(document.querySelector(".footer"))
    let getkeyword=document.querySelector("#keyword");
    keyword=getkeyword.value;
    // console.log(keyword);
    page=0;

    let emptyPage = document.querySelector(".main__att1--setup");
    emptyPage.replaceChildren();
    
    load()
})

main__att1 = document.querySelector(".main__att1--setup");
// 連綫到後端取得資料
function load(){
    // console.log("page",page, "keyword", keyword)
    if(page == null){
        // console.log("沒有更多資料")
        intersectionObserver.unobserve(document.querySelector(".footer"))
    }
    else{
        src="/api/attractions?page="+page+"&keyword="+keyword
        // console.log("before fetch", src)
        fetch(src)
            .then(function(response){
                // console.log("in fetch", src)
                // console.log("response", response)
                return response.json();
            }).then(function(result){
                let data=result["data"]
                // console.log("data", data)
                page = result["nextPage"]
                // console.log("next page", page)
                if(data.length == 0 || data == undefined){
                    main__att1.replaceChildren();
                    let nothing = document.createElement("div");
                    // console.log("沒有搜尋結果")
                    nothing.innerText="沒有搜尋結果";
                    nothing.className="out"
                    main__att1.appendChild(nothing)
                    intersectionObserver.unobserve(document.querySelector(".footer"))
                }
                else{
                    // 開始搜尋
                    // console.log("fetching for: ", keyword)
                    for(i=0;i<data.length;i++){
                        // console.log(data[i]["name"])
                        // 呼叫想要加入div
                        let main__att1=document.querySelector('.main__att1--setup');
                        // 製造框架同時加入class設定，然後append到section裏面
                        const main__card=document.createElement('div');
                        main__card.className="main__att1";
                        // console.log(data[i]["id"])
                        main__card.id=data[i]["off_id"];
                        main__card.onclick=function(){
                            // let id = main__card.id
                            // console.log(main__card.id)
                            location.href = "/attraction/" + main__card.id
                        }

                        main__att1.appendChild(main__card);

                        const main__photo=document.createElement('div');
                        main__photo.style.backgroundImage='url('+data[i]["images"][0]+')';
                        main__photo.className="main__att1--photo";
                        main__card.appendChild(main__photo);

                        const main__photoBg=document.createElement('div');
                        main__photoBg.className="main__att1--photo--Bg";
                        main__photo.appendChild(main__photoBg);
                        
                        const main__photoWd=document.createElement('span');
                        main__photoWd.innerText=data[i]["name"];
                        main__photoWd.className="main__att1--photo--word";
                        main__photoBg.appendChild(main__photoWd);
                        
                        const main__desc=document.createElement('div');
                        main__desc.className="main__att1--desc";
                        main__card.appendChild(main__desc);
                        
                        const main__descMrt=document.createElement('span');
                        main__descMrt.innerText=data[i]["mrt"];
                        main__descMrt.className="main__att1--desc--mrt";
                        main__desc.appendChild(main__descMrt);

                        const main__descCat=document.createElement('span');
                        main__descCat.innerText=data[i]["category"];
                        main__descCat.className="main__att1--desc--cat";
                        main__desc.appendChild(main__descCat);
                    }
                }
                // 呼叫 Inf Scroller
                // console.log("start observe")
                intersectionObserver.observe(document.querySelector(".footer"))
            })
    }
}

// 查看過往訂單連結
const checkOrder_link = document.querySelector(".checkOrder_link");
checkOrder_link.addEventListener("click", () => {
    console.log("redirect")
    // 打開表單，先到注冊頁面
    const signin = document.querySelector(".nav__right--user");
    if(signin.innerText == "登入/註冊"){
        modal.showModal();
    }
    else{
        window.location.href = "/order";
    }
})