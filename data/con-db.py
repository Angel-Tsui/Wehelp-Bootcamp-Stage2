import urllib.request as request
import json
import mysql.connector

con=mysql.connector.connect(
    user="root",
    password="",
    host="localhost",
    database="tp"
)

with open("taipei-attractions.json", mode="r", encoding="utf-8") as response:
    data=json.load(response)

attractions=data["result"]["results"]

# 用 dictionary 存放圖片 景點名字：景點的所有圖片
photo={}
for i in attractions:
    # 取到所有圖片
    images=i["file"]
    incomplete=images.split('https')
    # 清除資料
    clean=[]
    for each in incomplete:
        if (each != "") and ("JPG" in each or "PNG" in each or "jpg" in each or "png" in each):
            clear="https"+each
            clean.append(clear)
    photo[i["name"]]=clean
    # print(i["name"])
    cursor=con.cursor(dictionary=True)
    cursor.execute('INSERT INTO attraction(off_id,name,lat,lng,address)VALUES(%s,%s,%s,%s,%s)',(i["_id"],i["name"],i["latitude"],i["longitude"],i["address"]))
    cursor.execute('SELECT id FROM attraction ORDER BY id DESC LIMIT 1')
    each_id=cursor.fetchone()
    # print(each_id)
    indi_id=each_id["id"]
    for r in range(0,len(photo[i["name"]])):
        each_photo=photo[i["name"]][r]
        # print(each_photo)
        cursor.execute('INSERT INTO all_images(att_id,images)VALUES(%s,%s)',(indi_id,each_photo))
    # print(len(photo[i["name"]]))
    cursor.execute('INSERT INTO info(att_id,category,description,transport,mrt)VALUES(%s,%s,%s,%s,%s)',(indi_id,i["CAT"],i["description"],i["direction"],i["MRT"]))
    con.commit()
    print("done")
con.close()
print("connection closed")