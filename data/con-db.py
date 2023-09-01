import urllib.request as request
import json
import mysql.connector

con=mysql.connector.connect(
    user="root",
    password="",
    host="localhost",
    database="tp1"
)

with open("taipei-attractions.json", mode="r", encoding="utf-8") as response:
    data=json.load(response)

attractions=data["result"]["results"]
print("Data Read Completed")

# 製造 table (attraction, info, all_images, others)
cursor=con.cursor()
cursor.execute('''CREATE TABLE attraction(
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    off_id BIGINT NOT NULL,
    name VARCHAR(50) NOT NULL,
    lat FLOAT NOT NULL,
    lng FLOAT NOT NULL,
    address VARCHAR(150) NOT NULL,
    UNIQUE(off_id, name))''')
cursor.execute('''CREATE TABLE info(
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    att_id BIGINT NOT NULL,
    category VARCHAR (100) NOT NULL,
    mrt VARCHAR(50),
    transport VARCHAR(255),
    description VARCHAR(255) NOT NULL,
    FOREIGN KEY(att_id) REFERENCES attraction(id))''')
cursor.execute('''CREATE TABLE all_images(
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    att_id BIGINT NOT NULL,
    images VARCHAR(255),
    FOREIGN KEY(att_id) REFERENCES attraction(id))''')
cursor.execute('''CREATE TABLE others(
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    att_id BIGINT NOT NULL,
    rate FLOAT,
    date DATE,
    ref_wp INT,
    avbegin DATE,
    langinfo INT,
    serial_no INT,
    memo_time VARCHAR(255),
    idpt VARCHAR(100),
    adend DATE,
    FOREIGN KEY(att_id) REFERENCES attraction(id))''')
con.commit()
cursor.close()
print("Database Table Creation Completed")

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
    cursor.execute('INSERT INTO others(att_id,rate,date,ref_wp,avbegin,langinfo,serial_no,memo_time,idpt,adend)VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)',(indi_id,i["rate"],i["date"],i["REF_WP"],i["avBegin"],i["langinfo"],i["SERIAL_NO"],i["MEMO_TIME"],i["idpt"],i["avEnd"]))
    con.commit()
print("Data Importation Completed")
cursor.close()
con.close()
print("Connection Closed")