from flask import *
app=Flask(__name__)
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True

import jwt
key = "keepsafe"
import datetime

import mysql.connector
from mysql.connector import Error
from mysql.connector import pooling

import requests

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

@app.route("/order")
def checkorder():
	return render_template("order.html")

@app.errorhandler(400)
def bad_request(e):
	print(e, "@", request.url)
	result={"error":True, "message":"沒有該景點編號，請重新搜尋"}
	return result

@app.errorhandler(404)
def not_found(e):
	print(e, "@", request.url)
	result={"error":True, "message":"查無此頁，請確認網址"}
	return result

@app.errorhandler(500)
def server_error(e):
	print(e, "@", request.url)
	result={"error":True, "message":"連綫錯誤，請重新載入"}
	return result

@app.route("/api/user", methods=["POST"])
def registerac():
	result = request.json
	name = result["name"]
	email = result["email"]
	password = result["password"]
	# print("name:", name, "email:", email, "passsword: ", password)
	try:
		connectionpool=pooling.MySQLConnectionPool(
			pool_name="mysqlpool",
			pool_size=3,
			pool_reset_session=True,
			user="root",
			password="",
			host="localhost",
			port=3306,
			database="tp1"
		)
		con=connectionpool.get_connection()
		if con.is_connected():
			cursor=con.cursor(dictionary = True)
			cursor.execute("SELECT*FROM user WHERE email=%s",(email,))
			existingEmail = cursor.fetchone()
			cursor.execute("SELECT*FROM user WHERE name=%s",(name,))
			existingUser = cursor.fetchone()
			if existingUser:
				message = {
					"error" : True,
					"message" : "此用戶名稱已被使用，請重新命名"
				}
			elif existingEmail:
				message = {
					"error" : True,
					"message" : "此電子郵件已登記"
				}
			else:
				cursor.execute("INSERT INTO user(name,email,password)VALUES(%s,%s,%s)",(name, email, password))
				con.commit()
				message = {
					"ok" : True
				}
			return message
	# catch any error due to connection issue
	except Error as e:
		print("Failed, Connection Problem", e)
		return (500)
	# close db connection and return the connection object to the connection pool for the next usage if it the object was connected
	finally:
		con.close()
		print("MySQL connection is closed")

@app.route("/api/user/auth", methods=["PUT","GET"])
def signin():
	try:
		connectionpool=pooling.MySQLConnectionPool(
			pool_name="mysqlpool",
			pool_size=3,
			pool_reset_session=True,
			user="root",
			password="",
			host="localhost",
			port=3306,
			database="tp1"
		)
		con=connectionpool.get_connection()
		if con.is_connected():
			cursor=con.cursor(dictionary = True)
			if request.method == "PUT":
				# print("PUT")
				result = request.json
				# print(result)
				useremail = result["email"]
				userpassword = result["password"]
				# print(useremail, userpassword)
				cursor.execute("SELECT*FROM user WHERE email=%s and password=%s",(useremail, userpassword))
				validuser = cursor.fetchone()
				# print(validuser)
				if validuser:
					encoded_userinfo = jwt.encode(
						{
							"id" : validuser["id"],
							"name" : validuser["name"],
							"email" : validuser["email"],
							"exp" : datetime.datetime.utcnow() + datetime.timedelta(days=7)
						}, key, algorithm="HS256")
					# print(encoded_userinfo)
					token = jwt.decode(encoded_userinfo, key, algorithms="HS256")
					# print(token["useremail"])
					message = {
						"token" : encoded_userinfo
					}
				else:
					message = {
						"error" : True,
						"message" : "沒有此用戶，請點擊注冊下面注冊"
					}
			elif request.method == "GET":
				url = "/api/user/auth"
				headers = {
					'Authorization' : request.headers.get('Authorization'),
					'Accept' : 'application/json',
					'Content-Type' : 'application/json'
				}
				# print(headers)
				encryp_token = headers["Authorization"]
				# print(encryp_token)
				clean_token = encryp_token.replace("Bearer ", "")
				# print("token:", clean_token)

				token = jwt.decode(clean_token, key, algorithms="HS256")
				# print("needed_info: ", needed_info)
				needed_info = {
								"id" : token["id"],
								"name" : token["name"],
								"email" : token["email"]
							  }
				# print("token", token)
				if token:
					message = {
						"data" : needed_info
					}
				else:
					message = {
						"data" : None
					}
			return message
	# catch any error due to connection issue
	except Error as e:
		print("Failed, Connection Problem", e)
		return (500)
	# close db connection and return the connection object to the connection pool for the next usage if it the object was connected
	finally:
		con.close()
		print("MySQL connection is closed")

@app.route("/api/attractions")
def getData():
	try:
		connectionpool=pooling.MySQLConnectionPool(
			pool_name="mysqlpool",
			pool_size=3,
			pool_reset_session=True,
			user="root",
			password="",
			host="localhost",
			port=3306,
			database="tp1"
		)
		
		# get connection object from the connection pool
		con=connectionpool.get_connection()
		if con.is_connected():
			# print("connected to MySQL database using connection pool, MySQL Server version on ", db_info)
			# print("attractions", con.pool_name)
			# 取得 GET 拿到的資料
			keyword=request.args.get("keyword")
			# print("Query Keyword:", keyword)
			page=request.args.get("page")
			# print("Query Page:", page)
			# per_page 代表每一頁顯示多少資料
			per_page=12
			# create cursor object to execute MySQL commands
			cursor = con.cursor(dictionary=True)
				# count 代表取得總共要拿多少筆資料的數字
			# if cursor:
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
				cursor.execute('SELECT attraction.id, attraction.off_id, attraction.name, info.category, info.description, attraction.address, info.transport, info.mrt, attraction.lat, attraction.lng FROM attraction INNER JOIN info ON attraction.id=info.att_id WHERE info.mrt=%s OR attraction.name LIKE %s ORDER BY attraction.id asc LIMIT %s OFFSET %s',(keyword, n_keyword, per_page, off_set))
			else:
				cursor.execute('SELECT attraction.id, attraction.off_id, attraction.name, info.category, info.description, attraction.address, info.transport, info.mrt, attraction.lat, attraction.lng FROM attraction INNER JOIN info ON attraction.id=info.att_id ORDER BY attraction.id asc LIMIT %s OFFSET %s',(per_page, off_set))
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
	# catch any error due to connection issue
	except Error as e:
		print("Failed, Connection Problem", e)
		return (500)
	# close db connection and return the connection object to the connection pool for the next usage if it the object was connected
	finally:
			con.close()
			print("MySQL connection is closed")
			
@app.route("/api/attraction/<attractionId>")
def attID(attractionId):
	try:
		connectionpool=pooling.MySQLConnectionPool(
			pool_name="mysqlpool",
			pool_size=3,
			pool_reset_session=True,
			user="root",
			password="",
			host="localhost",
			port=3306,
			database="tp1"
		)
		# print("Connection Pool Name", connectionpool.pool_name)
		# print("Connection Pool Size", connectionpool.pool_size)
		
		# get connection object from the connection pool
		con=connectionpool.get_connection()
		if con.is_connected():
			attractionId=int(attractionId)
			# print("Query Attraction Id:", attractionId)
			cursor=con.cursor(dictionary=True)
			cursor.execute('SELECT*FROM attraction INNER JOIN info ON attraction.id=info.att_id INNER JOIN all_images ON attraction.id=all_images.att_id WHERE attraction.off_id=%s',(attractionId,))
			att_info=cursor.fetchall()
			# print(len(att_info))
			if len(att_info) == 0:
				# print("Failed, Unknown Attraction Id")
				abort(400)
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
				# print("Query Completed")
				return {"data":att_profile}
	except Error as e:
		print("Failed, Connection Problem", e)
		return (500)
	# close db connection and return the connection object to the connection pool for the next usage if it the object was connected
	finally:
		if con.is_connected():
			con.close()
			print("MySQL connection is closed")	

@app.route("/api/mrts")
def mrt():
	try:
		connectionpool=pooling.MySQLConnectionPool(
			pool_name="mysqlpool",
			pool_size=3,
			pool_reset_session=True,
			user="root",
			password="",
			host="localhost",
			port=3306,
			database="tp1"
		)
		
		# get connection object from the connection pool
		con=connectionpool.get_connection()
		if con.is_connected():
			# print("mtr", con.pool_name)
			cursor=con.cursor(dictionary=True)
			cursor.execute('SELECT mrt, COUNT(mrt) FROM info GROUP BY mrt ORDER BY COUNT(mrt) desc LIMIT 40')
			mrt=cursor.fetchall()
			mrt_name=[]
			for i in mrt:
				indi_name=i["mrt"]
				mrt_name.append(indi_name)
			# print(mrt_name)
			return {"data":mrt_name}
	# catch any error due to connection issue
	except Error as e:
		print("Failed, Connection Problem", e)
		return (500)
	# close db connection and return the connection object to the connection pool for the next usage if it the object was connected
	finally:
		if con.is_connected():
			con.close()
			print("MySQL connection is closed")	

@app.route("/api/booking", methods=["POST","GET"])
def prebook():
	# print("request method: ", request.method)
	try:
		connectionpool=pooling.MySQLConnectionPool(
			pool_name="mysqlpool",
			pool_size=3,
			pool_reset_session=True,
			user="root",
			password="",
			host="localhost",
			port=3306,
			database="tp1"
		)
		# get connection object from the connection pool
		con=connectionpool.get_connection()
		cursor=con.cursor(dictionary = True)
		if con.is_connected():
			headers = {
				'Authorization' : request.headers.get('Authorization'),
				'Accept' : 'application/json',
				'Content-Type' : 'application/json'
			}
			# print(headers)
			encryp_token = headers["Authorization"]
			# print(encryp_token)
			clean_token = encryp_token.replace("Bearer ", "")
			# print("token:", clean_token)

			clean_token = clean_token.strip('\"')
			token = jwt.decode(clean_token, key, algorithms="HS256")
			# print("decoded", token, "userId", token["id"])
			
			if token:
				userId = token["id"]
				if request.method == "POST":
					print("in POST")
					result = request.json
					attractionId = result["attractionId"]
					date = result["date"]
					time = result["time"]
					price = result["price"]
					# print(userId, attractionId, date, time, price)
					cursor=cursor.execute("INSERT INTO booking(user_id, off_id, date, time, price)VALUES(%s,%s,%s,%s,%s)",(userId, attractionId, date, time, price))
					con.commit()
					message = {
						"ok" : True
					}
				elif request.method == "GET":
					print("in GET")
					cursor.execute("SELECT attraction.id, attraction.off_id, attraction.name, attraction.address FROM attraction INNER JOIN booking ON attraction.off_id=booking.off_id INNER JOIN user ON booking.user_id=user.id WHERE user.id=%s and booking.payment_status=1",(userId,))
					attractionDetails = cursor.fetchall()
					# print("attractionDetails: ", attractionDetails, len(attractionDetails))
					if len(attractionDetails) == 0:
						message = {
							"data" : None
						}
					else:
						# print("in else")
						all_data=[]
						data={}
						for x in range(len(attractionDetails)):
							cursor.execute("SELECT*FROM booking WHERE user_id=%s and payment_status=1",(userId,))
							bookingInfo = cursor.fetchall()
							print("bookingInfo", bookingInfo)
							cursor.execute("SELECT images FROM all_images WHERE att_id=%s",(attractionDetails[x]["id"],))
							attractionImage = cursor.fetchall()
							fImage = attractionImage[0]
							Image = fImage["images"]
							# print("fImage", fImage)
							# print(attractionDetails, Image, bookingInfo)
							y = {
								"attraction" : {
										"id" : attractionDetails[x]["off_id"],
										"name" : attractionDetails[x]["name"],
										"address" : attractionDetails[x]["address"],
										"image" : Image
									},
									"date" : bookingInfo[x]["date"],
									"time" : bookingInfo[x]["time"],
									"price" : bookingInfo[x]["price"],
									"bookingId" : bookingInfo[x]["id"]
							}
							print("y", y)
							data[str(x)] = y
							all_data.append(data)
							x+=1
						print("all_data", all_data, len(all_data))
						message = {}
						for d in range(len(all_data)):
							message["data"] = all_data[d]
			else:
				message = {
					"error" : True,
					"message" : "請先登入"
				}
			return message
	# catch any error due to connection issue
	except Error as e:
		print("Failed, Connection Problem", e)
		return (500)
	# close db connection and return the connection object to the connection pool for the next usage if it the object was connected
	finally:
		if con.is_connected():
			con.close()
			print("MySQL connection is closed")

@app.route("/api/booking/<bookingId>", methods=["DELETE"])
def delbooking(bookingId):
	try:
		connectionpool=pooling.MySQLConnectionPool(
			pool_name="mysqlpool",
			pool_size=3,
			pool_reset_session=True,
			user="root",
			password="",
			host="localhost",
			port=3306,
			database="tp1"
		)
		# get connection object from the connection pool
		con=connectionpool.get_connection()
		cursor=con.cursor(dictionary = True)
		if con.is_connected():
			headers = {
				'Authorization' : request.headers.get('Authorization'),
				'Accept' : 'application/json',
				'Content-Type' : 'application/json'
			}
			# print(headers)
			encryp_token = headers["Authorization"]
			# print(encryp_token)
			clean_token = encryp_token.replace("Bearer ", "")
			# print("token:", clean_token)

			token = jwt.decode(clean_token, key, algorithms="HS256")
			print("decoded", token, "userId", token["id"])

			if token:
				print("in DELETE")
				userId = token["id"]
				print(userId, bookingId)
				cursor.execute("DELETE FROM booking WHERE user_id=%s and id=%s",(userId, bookingId))
				con.commit()
				message = {
					"ok" : True
				}
			else:
				message = {
					"error" : True,
					"message" : "請先登入"
				}
			return message
	# catch any error due to connection issue
	except Error as e:
		print("Failed, Connection Problem", e)
		return (500)
	# close db connection and return the connection object to the connection pool for the next usage if it the object was connected
	finally:
		if con.is_connected():
			con.close()
			print("MySQL connection is closed")

@app.route("/api/orders", methods=["POST"])
def order():
	try:
		connectionpool=pooling.MySQLConnectionPool(
			pool_name="mysqlpool",
			pool_size=3,
			pool_reset_session=True,
			user="root",
			password="",
			host="localhost",
			port=3306,
			database="tp1"
		)
		# get connection object from the connection pool
		con=connectionpool.get_connection()
		cursor=con.cursor(dictionary = True)
		if con.is_connected():
			headers = {
				'Authorization' : request.headers.get('Authorization'),
				'Accept' : 'application/json',
				'Content-Type' : 'application/json'
			}
			# print(headers)
			encryp_token = headers["Authorization"]
			# print(encryp_token)
			clean_token = encryp_token.replace("Bearer ", "")
			# print("token:", clean_token)

			clean_token = clean_token.strip('\"')
			token = jwt.decode(clean_token, key, algorithms="HS256")
			# print("decoded", token, "userId", token["id"])
			
			if token:
				userId = token["id"]
				result = request.json
				# print(result)
				user_phone = result["order"]["contact"]["phone"]
				# print(user_phone)




				trip_info = result["order"]["trip"]
				order_number = result["prime"][-15:]
				print("trip_info", trip_info)
				# 把電話號碼的資料更新到 user 資料表中
				cursor.execute("UPDATE user SET phone=%s WHERE id=%s",(user_phone, userId))
				# 把資料放到資料庫 orders 資料表裏，目前所有 payment 的 status 都是 1，即還沒有付款
				for x in trip_info:
					bookingId = trip_info[x]["bookingId"]
					# print(userId, bookingId, order_number)

					# 把 order_number 更新到 booking 資料表
					print("order_number & bookingID", order_number, type(order_number), bookingId)
					cursor.execute("UPDATE booking SET order_number=%s WHERE id=%s and user_id=%s",(order_number, bookingId, userId))

					# cursor.execute("INSERT INTO orders(user_id, booking_id, order_number)VALUES(%s,%s,%s)",(userId, bookingId, order_number))
					# con.commit()
				
				# 取得所需資訊，準備傳送到 TapPay API
				# print(result)
				prime = result["prime"]
				amount = result["order"]["price"]
				contact = result["order"]["contact"]
				# print(prime, amount, contact)
				card_holder = {
					"phone_number" : contact["phone"],
					"name" : contact["name"],
					"email" : contact["email"]
				}
				data = {
					"partner_key": "partner_erH47Tx5VSSlIfEWS6PfYn1Usn5zM62jBr87PJlJom4hSnp9tDu0SNNb",
					"prime" : prime,
					"amount" : amount,
					"merchant_id" : "AngelWehelp_CTBC",
					"details" : "台北一日遊",
					"cardholder" : card_holder
				}
				data=json.dumps(data)
				# print(type(data), data)
				# print(prime, amount, contact, card_holder)
				cursor.execute("SELECT * FROM booking WHERE order_number=%s",(order_number,))
				# cursor.execute("SELECT * FROM orders WHERE order_number=%s",(order_number,))
				before=cursor.fetchall()
				# print("before", before)

				# 連接到 TapPay 的 API 完成付款程序
				src = "https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime"
				headers = {"Content-Type": "application/json; charset=utf-8", "x-api-key":"partner_erH47Tx5VSSlIfEWS6PfYn1Usn5zM62jBr87PJlJom4hSnp9tDu0SNNb"}
				response = requests.post(src, headers=headers, data=data)
				# print("response", response.status_code)

				result = response.json()
				# print("result", result)
				payment_status = result["status"]
				# print(payment_status)

				if payment_status == 0:
					# 更新orders資料表的訂單 status
					cursor.execute("UPDATE booking SET payment_status=%s WHERE user_id=%s",(payment_status, userId))
					# cursor.execute("UPDATE orders SET payment_status=%s WHERE user_id=%s",(payment_status, userId))
					con.commit()

					# 最後看看是否所有 payment 的 status，再把結果送到前端
					cursor.execute("SELECT * FROM booking WHERE order_number=%s",(order_number,))
					# cursor.execute("SELECT * FROM orders WHERE order_number=%s",(order_number,))
					user_order=cursor.fetchall()
					# print("after", user_order)
					confirm = []
					for x in user_order:
						if x["payment_status"] == 0:
							confirm.append(x["id"])
					# print(confirm)

					# print(len(confirm), len(user_order))
					if len(confirm) == len(user_order):
						status = 0
						message = "付款成功"
					else:
						status = 1
						message = "付款失敗，請確認資訊"

					message = {
						"data" : {
							"number" : order_number,
							"payment" : {
								"status" : status,
								"message" : message
							}
						}
					}
					
					# 把 booking 資料表裏的相關訂單刪除
					# for q in user_order:
					# 	cursor.execute("DELETE FROM booking WHERE user_id=%s and id=%s",(userId, q["booking_id"]))
					# 	con.commit()
				else:
					message = {
						"error" : True,
						"message" : "資料錯誤，請重新嘗試"
					}
				return message

	# catch any error due to connection issue
	except Error as e:
		print("Failed, Connection Problem", e)
		return (500)
	# close db connection and return the connection object to the connection pool for the next usage if it the object was connected
	finally:
		if con.is_connected():
			con.close()
			print("MySQL connection is closed")

@app.route("/api/order/<orderNumber>")
def searchOrder(orderNumber):
	try:
		connectionpool=pooling.MySQLConnectionPool(
			pool_name="mysqlpool",
			pool_size=3,
			pool_reset_session=True,
			user="root",
			password="",
			host="localhost",
			port=3306,
			database="tp1"
		)
		# get connection object from the connection pool
		con=connectionpool.get_connection()
		cursor=con.cursor(dictionary = True)
		if con.is_connected():
			headers = {
				'Authorization' : request.headers.get('Authorization'),
				'Accept' : 'application/json',
				'Content-Type' : 'application/json'
			}
			# print(headers)
			encryp_token = headers["Authorization"]
			# print(encryp_token)
			clean_token = encryp_token.replace("Bearer ", "")
			# print("token:", clean_token)

			clean_token = clean_token.strip('\"')
			token = jwt.decode(clean_token, key, algorithms="HS256")
			print("decoded", token, "userId", token["id"])
			
			if token:
				userId = token["id"]

				cursor.execute("SELECT booking.order_number, user.id, user.email, user.phone, booking.payment_status, booking.off_id, attraction.id, attraction.name, attraction.address, booking.date, booking.time, booking.price FROM user INNER JOIN booking ON user.id=booking.user_id INNER JOIN attraction ON attraction.off_id=booking.off_id WHERE booking.order_number=%s and user.id=%s",(orderNumber, userId))
				user_info = cursor.fetchall()

				if user_info:
					
					contactName = token["name"]

					# print(user_info)
					all_price = []

					trip = []

					for x in user_info:
						# print("user info", x)
						number = x["order_number"]
						email = x["email"]
						phone = x["phone"]
						status = x["payment_status"]
						off_id = x["off_id"]
						att_name = x["name"]
						att_address = x["address"]
						date = x["date"]
						time = x["time"]
						price = x["price"]
						all_price.append(price)

						att_id = x["id"]
						# print(att_id)

						cursor.execute("SELECT images FROM all_images WHERE att_id=%s",(att_id,))
						images = cursor.fetchall()
						image = images[0]["images"]

						attraction = {
							"id" : off_id,
							"name" : att_name,
							"address" : att_address,
							"image" : image,
							"date" : date,
							"time" : time,
							"price" : price
						}
						trip.append(attraction)
					
					total_price = 0
					for x in all_price:
						x = int(x)
						total_price += x

					message = {
						"data" : {
							"number" : number,
							"total price" : total_price,
							"trip" : trip,
							"contact" : {
								"name" : contactName,
								"email" : email,
								"phone" : phone
							},
							"status" : status
						}
					}
				else:
					message = {
						"data" : None
					}
			else:
				message = {
					"error" : True,
					"message" : "請先登入"
				}
			return message

	# catch any error due to connection issue
	except Error as e:
		print("Failed, Connection Problem", e)
		return (500)
	# close db connection and return the connection object to the connection pool for the next usage if it the object was connected
	finally:
		if con.is_connected():
			con.close()
			print("MySQL connection is closed")

@app.route("/api/checkorder")
def getAllOrders():
	try:
		connectionpool=pooling.MySQLConnectionPool(
			pool_name="mysqlpool",
			pool_size=3,
			pool_reset_session=True,
			user="root",
			password="",
			host="localhost",
			port=3306,
			database="tp1"
		)
		# get connection object from the connection pool
		con=connectionpool.get_connection()
		cursor=con.cursor(dictionary = True)
		if con.is_connected():
			headers = {
				'Authorization' : request.headers.get('Authorization'),
				'Accept' : 'application/json',
				'Content-Type' : 'application/json'
			}
			# print(headers)
			encryp_token = headers["Authorization"]
			# print(encryp_token)
			clean_token = encryp_token.replace("Bearer ", "")
			# print("token:", clean_token)

			clean_token = clean_token.strip('\"')
			token = jwt.decode(clean_token, key, algorithms="HS256")
			print("check decoded", token, "userId", token["id"])
			
			if token:
				userId = token["id"]
				print("check", userId)
				cursor.execute("SELECT DISTINCT order_number FROM booking WHERE payment_status=0 and user_id=%s ORDER BY id DESC",(userId,))
				orders = cursor.fetchall()
				print(orders)
				all_orders = []
				for y in orders:
					all_orders.append(y["order_number"])
				message = {
					"data" : all_orders
				}
			return message


	# catch any error due to connection issue
	except Error as e:
		print("Failed, Connection Problem", e)
		return (500)
	# close db connection and return the connection object to the connection pool for the next usage if it the object was connected
	finally:
		if con.is_connected():
			con.close()
			print("MySQL connection is closed")


app.run(host="0.0.0.0", port=3000)