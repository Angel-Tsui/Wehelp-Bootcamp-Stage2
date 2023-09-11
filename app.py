from flask import *
app=Flask(__name__)
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True

import mysql.connector
from mysql.connector import pooling

connectionpool=mysql.connector.pooling.MySQLConnectionPool(
	pool_name="mysqlpool",
	# pool_size=3,
	pool_reset_session=True,
	user="root",
	password="",
	host="localhost",
	database="tp1"
)
con=connectionpool.get_connection()
print("main", con.pool_name)
# print(con.pool_size)

# con=mysql.connector.connect(
# 	user="root",
# 	password="",
# 	host="localhost",
# 	database="tp1"
# )

# Pages
@app.route("/")
def index():
	return render_template("index.html")
@app.route("/attraction/<id>")
def attraction(id):
	return render_template("attraction.html")
@app.route("/booking")
def booking():
	return render_template("booking.html")
@app.route("/thankyou")
def thankyou():
	return render_template("thankyou.html")

@app.errorhandler(400)
def bad_request(e):
	print(e, "@", request.url)
	result={"error":True, "message":"沒有該景點編號，請重新搜尋"}
	return result

# @app.errorhandler(404)
# def not_found(e):
# 	print(e, "@", request.url)
# 	result={"error":True, "message":"查無此頁，請確認網址"}
# 	return result

@app.errorhandler(500)
def server_error(e):
	print(e, "@", request.url)
	result={"error":True, "message":"連綫錯誤，請重新載入"}
	return result

@app.route("/api/attractions")
def getData():
	# con=con.get_connection()
	print("attractions", con.pool_name)
	# print(con.pool_size)
	# 取得 GET 拿到的資料
	keyword=request.args.get("keyword")
	print("Query Keyword:", keyword)
	page=request.args.get("page")
	print("Query Page:", page)
	# per_page 代表每一頁顯示多少資料
	per_page=12
	cursor=con.cursor(dictionary=True)
	if cursor:
		# count 代表取得總共要拿多少筆資料的數字
		if keyword != None:
			n_keyword='%'+keyword+'%'
			cursor.execute('SELECT COUNT(attraction.id) FROM attraction INNER JOIN info ON attraction.id=info.att_id WHERE info.mrt=%s OR attraction.name LIKE %s ORDER BY attraction.id asc',(keyword, n_keyword))
			total=cursor.fetchone()
			count=total["COUNT(attraction.id)"]
		else:
			cursor.execute('SELECT COUNT(id) FROM attraction')
			total=cursor.fetchone()
			count=total["COUNT(id)"]

		# off_set 代表每一頁顯示的第一筆資料 如 off_set = 12，代表那一頁的第一筆資料是第12順位的資料
		if page != None:
			# 處理 page 參數，把 GET 取得的字串換成數字
			page=int(page)
			off_set=page*per_page
		else:
			off_set = (per_page * (count // per_page))

		# query 代表取得的資料，做後續處理
		if keyword != None:
			cursor.execute('SELECT attraction.id, attraction.name, info.category, info.description, attraction.address, info.transport, info.mrt, attraction.lat, attraction.lng FROM attraction INNER JOIN info ON attraction.id=info.att_id WHERE info.mrt=%s OR attraction.name LIKE %s ORDER BY attraction.id asc LIMIT %s OFFSET %s',(keyword, n_keyword, per_page, off_set))
		else:
			cursor.execute('SELECT attraction.id, attraction.name, info.category, info.description, attraction.address, info.transport, info.mrt, attraction.lat, attraction.lng FROM attraction INNER JOIN info ON attraction.id=info.att_id ORDER BY attraction.id asc LIMIT %s OFFSET %s',(per_page, off_set))
		query=cursor.fetchall()

		# 計算總共多少筆資料，num 代表下一頁的頁數，如沒有下一頁則顯示 None
		if (count - off_set) <= per_page:
			num = None
		else:
			num = page + 1
		
		# 把每一個取得的景點圖片帶入輸出的資料中
		all_profile=[]
		att_profile={}
		for q in query:
			# 根據 query 中景點的 id 取得所有相關圖片 (dict)
			cursor.execute('SELECT images FROM all_images WHERE att_id=%s',(q["id"],))
			each_image=cursor.fetchall()
			# attractioniImages 代表該景點的所有圖片
			attractioniImages=[]
			# 用 for loop 取得該景點的每一張圖片，放進 attractioniImages 容器 (array) 裏面
			for i in each_image:
				attractioniImages.append(i["images"])
				# 把 attractioniImages (array) 放到 query (dict) 裏作爲 image (key) 的 value
				q["images"]=attractioniImages
		return {"nextPage":num,"data":query}
		cursor.close()
		con.close()
	else:
		print("Failed, Connection Problem")
		return (500)

@app.route("/api/attraction/<attractionId>")
def attID(attractionId):
	attractionId=int(attractionId)
	print("Query Attraction Id:", attractionId)
	cursor=con.cursor(dictionary=True)
	if cursor:
		cursor.execute('SELECT*FROM attraction INNER JOIN info ON attraction.id=info.att_id INNER JOIN all_images ON attraction.id=all_images.att_id WHERE attraction.off_id=%s',(attractionId,))
		att_info=cursor.fetchall()
		# print(len(att_info))
		if len(att_info) == 0:
			print("Failed, Unknown Attraction Id")
			abort(400)
			# return {"error":True, "message":"查無此頁，請確認網址"}
		else:
			# print(att_info)
			att_profile={}
			images=[]
			for a in att_info:
				images.append(a["images"])
				att_profile["id"]=a["off_id"]
				att_profile["name"]=a["name"]
				att_profile["category"]=a["category"]
				att_profile["description"]=a["description"]
				att_profile["address"]=a["address"]
				att_profile["transport"]=a["transport"]
				att_profile["mrt"]=a["mrt"]
				att_profile["lat"]=a["lat"]
				att_profile["lng"]=a["lng"]
				att_profile["images"]=images
			print("Query Completed")
			return {"data":att_profile}
			con.close()
	else:
		print("Failed, Connection Problem")
		return (500)

@app.route("/api/mrts")
def mrt():
	print("mtr", con.pool_name)
	cursor=con.cursor(dictionary=True)
	if cursor:
		cursor.execute('SELECT mrt, COUNT(mrt) FROM info GROUP BY mrt ORDER BY COUNT(mrt) desc LIMIT 40')
		mrt=cursor.fetchall()
		mrt_name=[]
		for i in mrt:
			indi_name=i["mrt"]
			mrt_name.append(indi_name)
		# print(mrt_name)
		return {"data":mrt_name}
		con.close()
	else:
		return (500)

app.run(host="0.0.0.0", port=3000)