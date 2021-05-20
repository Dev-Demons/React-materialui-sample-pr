from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_restful import Resource, Api
from datetime import datetime
from flask_cors import CORS, cross_origin

app = Flask(__name__)

# Avoiding Cors issue from Client request
# , resources={r"/*": {"origins": "*"}}
CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

api = Api(app)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///data.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)
ma = Marshmallow(app)

class Client(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(3), unique=True, nullable=True)
    name = db.Column(db.String(255), nullable=True)
    commission = db.Column(db.Float, nullable=True)
    type = db.Column(db.String(10), nullable=True)
    create_at = db.Column(db.DateTime, nullable=True)
    update_at = db.Column(db.DateTime)
    status = db.Column(db.String(10), nullable=True)

    def __init__(self, code, name, comm, type, create_at, update_at, status):
        self.code = code
        self.name = name
        self.commission = comm
        self.type = type
        self.create_at = create_at
        self.update_at = update_at
        self.status = status

class Venue(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(3), unique=True, nullable=True)
    name = db.Column(db.String(255), nullable=True)
    fee = db.Column(db.Float, nullable=True)
    wallet_name = db.Column(db.String(81), nullable=True)
    wallet_addr = db.Column(db.String(255), nullable=True)
    bank_name = db.Column(db.String(255), nullable=True)
    bank_number = db.Column(db.String(81), nullable=True)
    account_number = db.Column(db.String(81), nullable=True)
    account_name = db.Column(db.String(81), nullable=True)
    create_user = db.Column(db.Integer)
    create_at = db.Column(db.DateTime, nullable=True)
    update_user = db.Column(db.Integer)
    update_at = db.Column(db.DateTime)
    status = db.Column(db.String(10), nullable=True)

    def __init__(self, code, name, fee, wallet_name, wallet_addr, bank_name, bank_number, account_number, account_name, create_user, create_at, update_user, update_at, status):
        self.code = code
        self.name = name
        self.fee = fee
        self.wallet_name = wallet_name
        self.wallet_addr = wallet_addr
        self.bank_name = bank_name
        self.bank_number = bank_number
        self.account_number = account_number
        self.account_name = account_name
        self.create_user = create_user
        self.create_at = create_at
        self.update_user = update_user
        self.update_at = update_at
        self.status = status

class Email(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, nullable=True)
    email_info = db.Column(db.String, nullable=True)
    create_at = db.Column(db.DateTime, nullable=True)
    update_at = db.Column(db.DateTime)
    status = db.Column(db.String(7))

    def __init__(self, client_id, email_info, create_at, update_at, status):
        self.client_id = client_id
        self.email_info = email_info
        self.create_at = create_at
        self.update_at = update_at
        self.status = status

class Wallet(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, nullable=True)
    wallet_info = db.Column(db.String, nullable=True)
    create_at = db.Column(db.DateTime, nullable=True)
    update_at = db.Column(db.DateTime)
    status = db.Column(db.String(7))

    def __init__(self, client_id, wallet_info, create_at, update_at, status):
        self.client_id = client_id
        self.wallet_info = wallet_info
        self.create_at = create_at
        self.update_at = update_at
        self.status = status

class Bank(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, nullable=True)
    bank_info = db.Column(db.String, nullable=True)
    create_user = db.Column(db.Integer, nullable=True)
    create_at = db.Column(db.DateTime)
    update_user = db.Column(db.Integer, nullable=True)
    update_at = db.Column(db.DateTime, nullable=True)
    status = db.Column(db.String(7))

    def __init__(self, client_id, bank_info, create_user, create_at, update_user, update_at, status):
        self.client_id = client_id
        self.bank_info = bank_info
        self.create_user = create_user
        self.create_at = create_at
        self.update_user = update_user
        self.update_at = update_at
        self.status = status

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(1), unique=True)
    trade_date = db.Column(db.String(30))
    client_leg = db.Column(db.String, nullable=True)
    market_leg = db.Column(db.String, nullable=True)
    create_at = db.Column(db.DateTime)
    create_user = db.Column(db.Integer, nullable=True)
    update_at = db.Column(db.DateTime, nullable=True)
    update_user = db.Column(db.Integer, nullable=True)
    status = db.Column(db.String(10))

    def __init__(self, type, trade_date, client_leg, market_leg, create_at, create_user, update_at, update_user, status):
        self.type = type
        self.trade_date = trade_date
        self.client_leg = client_leg
        self.market_leg = market_leg
        self.create_at = create_at
        self.create_user = create_user
        self.update_at = update_at
        self.update_user = update_user
        self.status = status

class ClientSchema(ma.Schema):
    class Meta:
        fields = (
            "id",
            "code",
            "name",
            "commission",
            "type",
            "create_at",
            "update_at",
            "status",
        )

class VenueSchema(ma.Schema):
    class Meta:
        fields = (
            "id",
            "code",
            "name",
            "fee",
            "wallet_name",
            "wallet_addr",
            "bank_name",
            "bank_number",
            "account_number",
            "account_name",
            "create_user",
            "update_user",
            "create_at",
            "update_at",
            "status",
        )

class EmailSchema(ma.Schema):
    class Meta:
        fields = (
            "id",
            "client_id",
            "email_info",
            "create_at",
            "update_at",
            "status",
        )

class WalletSchema(ma.Schema):
    class Meta:
        fields = (
            "id",
            "client_id",
            "wallet_info",
            "create_at",
            "update_at",
            "status",
        )

class BankSchema(ma.Schema):
    class Meta:
        fields = (
            "id",
            "client_id",
            "bank_info",
            "create_user",
            "create_at",
            "update_user",
            "update_at",
            "status",
        )

class OrderSchema(ma.Schema):
    class Meta:
        fields = (
            "id",
            "type",
            "trade_date",
            "client_leg",
            "market_leg",
            "create_user",
            "create_at",
            "update_user",
            "update_at",
            "status",
        )

client_schema = ClientSchema()
clients_schema = ClientSchema(many=True)
venue_schema = VenueSchema()
venues_schema = VenueSchema(many=True)
email_schema = EmailSchema()
emails_schema = EmailSchema(many=True)
wallet_schema = WalletSchema()
wallets_schema = WalletSchema(many=True)
bank_schema = BankSchema()
banks_schema = BankSchema(many=True)
order_schema = OrderSchema()
orders_schema = OrderSchema(many=True)

class ClientManager(Resource):
    @staticmethod
    @cross_origin()
    def get():
        try:
            id = request.args["id"]
        except Exception as _:
            id = None

        if not id:
            clients = Client.query.filter(Client.status == 'Active').all()
            return jsonify(clients_schema.dump(clients))
        client = Client.query.get(id)
        return jsonify(client_schema.dump(client))

    @staticmethod
    @cross_origin()
    def post():
        code = request.json["code"]
        name = request.json["name"]
        commission = request.json["commission"]
        type = request.json["type"]
        create_at = datetime.now()
        update_at = datetime.now()
        status = request.json["status"]
        id = ''

        client = Client(code, name, commission, type, create_at, update_at, status)
        try:
            db.session.add(client)
            db.session.commit()
            db.session.flush()
            # db.session.refresh(client)
            id = client.id
        except Exception:
            return jsonify({"Message": "Something wrong to insert data!", "Status": 0})

        return jsonify({"Message": f"Client {name} inserted.", "Status": 1, "client_id": id})

    @staticmethod
    @cross_origin()
    def put():
        try: id = request.args['id']
        except Exception as _: id = None
        if not id:
            return jsonify({ 'Message': 'Must provide the client ID', "Status": 0 })
        client = Client.query.get(id)

        if request.json is None:
            client.update_at = datetime.now() 
        else:
            if "code" in request.json:
                client.code = request.json["code"]
            if "name" in request.json:    
                client.name = request.json["name"] 
            if "commission" in request.json:            
                client.commission = request.json["commission"] 
            if "type" in request.json:            
                client.type = request.json["type"]
            if "status" in request.json:            
                client.status = request.json["status"]
            client.update_at = datetime.now() 
        
        try:
            db.session.commit()
        except Exception:
            return jsonify({"Message": "Something wrong to insert data!", "Status": 0})

        return jsonify({
            'Message': f'Client {client.name} modified.', "Status": 1
        })

    @staticmethod
    @cross_origin()
    def delete():
        try:
            id = request.args["id"]
        except Exception as _:
            id = None
        if not id:
            return jsonify({"Message": "Must provide the user ID", "Status": 0})
        client = Client.query.get(id)

        try:
            db.session.delete(client)
            db.session.commit()
        except Exception:
            return jsonify({"Message": "Not found", "Status": 0})

        return jsonify({"Message": f"Client {client.name} deleted.", "Status": 1})

# VENUE ENDPOINT
class VenueManager(Resource):
    @staticmethod
    def get():
        try:
            id = request.args["id"]
        except Exception as _:
            id = None

        if not id:
            venues = Venue.query.filter(Venue.status == 'Active').all()
            return jsonify(venues_schema.dump(venues))
        venue = Venue.query.get(id)
        return jsonify(venue_schema.dump(venue))

    @staticmethod
    def post():
        code = request.json["code"]
        name = request.json["name"]
        fee = request.json["fee"]
        wallet_name = request.json["wallet_name"]
        wallet_addr = request.json["wallet_addr"]
        bank_name = request.json["bank_name"]
        bank_number = request.json["bank_number"]
        account_number = request.json["account_number"]
        account_name = request.json["account_name"]
        create_user = ""    # after login to get user ID
        update_user = ""
        create_at = datetime.now()
        update_at = datetime.now()
        status = request.json["status"]

        venue = Venue(code, name, fee, wallet_name, wallet_addr, bank_name, bank_number, account_number, account_name, create_user, create_at, update_user, update_at, status)
        try:
            db.session.add(venue)
            db.session.commit()
        except Exception:
            return jsonify({"Message": "Something wrong to insert data!", "Status": 0})

        return jsonify({"Message": f"Venue {name} inserted.", "Status": 1})

    @staticmethod
    def put():
        try: id = request.args['id']
        except Exception as _: id = None
        if not id:
            return jsonify({ 'Message': 'Must provide the venue ID', "Status": 0 })
        venue = Venue.query.get(id)

        if request.json is None:
            venue.update_at = datetime.now() 
        else:
            if "code" in request.json:
                venue.code = request.json["code"]
            if "name" in request.json:
                venue.name = request.json["name"] 
            if "fee" in request.json:
                venue.fee = request.json["fee"]
            if "wallet_name" in request.json:
                venue.wallet_name = request.json["wallet_name"]
            if "wallet_addr" in request.json:
                venue.wallet_addr = request.json["wallet_addr"]
            if "bank_name" in request.json:
                venue.bank_name = request.json["bank_name"]
            if "bank_number" in request.json:
                venue.bank_number = request.json["bank_number"]
            if "account_number" in request.json:
                venue.account_number = request.json["account_number"]
            if "account_name" in request.json:
                venue.account_name = request.json["account_name"]
            if "status" in request.json:            
                venue.status = request.json["status"]
            venue.update_at = datetime.now() 
        
        try:
            db.session.commit()
        except Exception:
            return jsonify({"Message": "Something wrong to insert data!", "Status": 0})

        return jsonify({
            'Message': f'Venue {venue.name} modified.', "Status": 1
        })

    @staticmethod
    def delete():
        try:
            id = request.args["id"]
        except Exception as _:
            id = None
        if not id:
            return jsonify({"Message": "Must provide the venue ID", "Status": 0})
        venue = Venue.query.get(id)

        try:
            db.session.delete(venue)
            db.session.commit()
        except Exception:
            return jsonify({"Message": "Not found", "Status": 0})

        return jsonify({"Message": f"Venue {venue.name} deleted.", "Status": 1})

# Email ENDPOINT
class EmailManager(Resource):
    @staticmethod
    def get():
        try:
            id = request.args["id"]
        except Exception as _:
            id = None

        if not id:
            results = Email.query.all()
            return jsonify(emails_schema.dump(results))
        result = Email.query.filter(Email.client_id == id).all()
        return jsonify(emails_schema.dump(result))
    @staticmethod
    def post():
        client_id = request.json["client_id"]
        email_info = request.json["email_info"]
        create_at = datetime.now()
        update_at = datetime.now()
        status = request.json["status"]

        result = Email(client_id, email_info, create_at, update_at, status)
        try:
            db.session.add(result)
            db.session.commit()
        except Exception:
            return jsonify({"Message": "Something wrong to insert data!", "Status": 0})

        return jsonify({"Message": f"New email inserted.", "Status": 1})

    @staticmethod
    def put():
        try: id = request.args['id']
        except Exception as _: id = None
        if not id:
            return jsonify({ 'Message': 'Must provide the Email ID', "Status": 0 })
        result = Email.query.get(id)

        if request.json is None:
            result.update_at = datetime.now() 
        else:
            if "email_info" in request.json:    
                result.email_info = request.json["email_info"] 
            result.update_at = datetime.now() 
        
        try:
            db.session.commit()
        except Exception:
            return jsonify({"Message": "Something wrong to insert data!", "Status": 0})

        return jsonify({
            'Message': f'Email info modified.', "Status": 1
        })

    @staticmethod
    def delete():
        try:
            id = request.args["id"]
        except Exception as _:
            id = None
        if not id:
            return jsonify({"Message": "Must provide the user ID", "Status": 0})
        result = Email.query.get(id)

        try:
            db.session.delete(result)
            db.session.commit()
        except Exception:
            return jsonify({"Message": "Not found", "Status": 0})

        return jsonify({"Message": f"Email info deleted.", "Status": 1})

# WALLET ENDPOINT
class WalletManager(Resource):
    @staticmethod
    def get():
        try:
            id = request.args["id"]
        except Exception as _:
            id = None

        if not id:
            results = Wallet.query.all()
            return jsonify(wallets_schema.dump(results))
        result = Wallet.query.filter(Wallet.client_id == id).all()
        return jsonify(wallets_schema.dump(result))
    @staticmethod
    def post():
        client_id = request.json["client_id"]
        wallet_info = request.json["wallet_info"]
        create_at = datetime.now()
        update_at = datetime.now()
        status = request.json["status"]

        result = Wallet(client_id, wallet_info, create_at, update_at, status)
        try:
            db.session.add(result)
            db.session.commit()
        except Exception:
            return jsonify({"Message": "Something wrong to insert data!", "Status": 0})

        return jsonify({"Message": f"New wallets inserted.", "Status": 1})

    @staticmethod
    def put():
        try: id = request.args['id']
        except Exception as _: id = None
        if not id:
            return jsonify({ 'Message': 'Must provide the Wallet ID', "Status": 0 })
        result = Wallet.query.get(id)

        if request.json is None:
            result.update_at = datetime.now() 
        else:
            if "wallet_info" in request.json:    
                result.wallet_info = request.json["wallet_info"] 
            result.update_at = datetime.now() 
        
        try:
            db.session.commit()
        except Exception:
            return jsonify({"Message": "Something wrong to insert data!", "Status": 0})

        return jsonify({
            'Message': f'Wallet info modified.', "Status": 1
        })

    @staticmethod
    def delete():
        try:
            id = request.args["id"]
        except Exception as _:
            id = None
        if not id:
            return jsonify({"Message": "Must provide the Wallet ID", "Status": 0})
        result = Wallet.query.get(id)

        try:
            db.session.delete(result)
            db.session.commit()
        except Exception:
            return jsonify({"Message": "Not found", "Status": 0})

        return jsonify({"Message": f"Wallet info deleted.", "Status": 1})

# Bank ENDPOINT
class BankManager(Resource):
    @staticmethod
    def get():
        try:
            id = request.args["id"]
            print('id => ', id)
        except Exception as _:
            id = None

        if not id:
            results = Bank.query.all()
            return jsonify(banks_schema.dump(results))

        result = Bank.query.filter(Bank.client_id == id).all()
        return jsonify(banks_schema.dump(result))
    @staticmethod
    def post():
        client_id = request.json["client_id"]
        bank_info = request.json["bank_info"]
        create_at = datetime.now()
        update_at = datetime.now()
        status = request.json["status"]

        result = Bank(client_id, bank_info, "", create_at, "", update_at, status)
        try:
            db.session.add(result)
            db.session.commit()
        except Exception:
            return jsonify({"Message": "Something wrong to insert data!", "Status": 0})

        return jsonify({"Message": f"New Bank inserted.", "Status": 1})

    @staticmethod
    def put():
        try: id = request.args['id']
        except Exception as _: id = None
        if not id:
            return jsonify({"Message": "Must provide the Bank ID", "Status": 0})
        result = Bank.query.get(id)

        if request.json is None:
            result.update_at = datetime.now() 
        else:
            if "bank_info" in request.json:    
                result.bank_info = request.json["bank_info"] 
            result.update_at = datetime.now() 
        
        try:
            db.session.commit()
        except Exception:
            return jsonify({"Message": "Something wrong to insert data!", "Status": 0})

        return jsonify({
            'Message': f'Bank info modified.', "Status": 1
        })

    @staticmethod
    def delete():
        try:
            id = request.args["id"]
        except Exception as _:
            id = None
        if not id:
            return jsonify({"Message": "Must provide the Bank ID", "Status": 0})
        result = Bank.query.get(id)

        try:
            db.session.delete(result)
            db.session.commit()
        except Exception:
            return jsonify({"Message": "Not found", "Status": 0})

        return jsonify({"Message": f"Bank info deleted.", "Status": 1})

# Order ENDPOINT
class OrderManager(Resource):
    @staticmethod
    def get():
        try:
            id = request.args["id"]
            print('id => ', id)
        except Exception as _:
            id = None

        if not id:
            results = Order.query.filter(Order.status == 'Active').all() # fetch Active Order
            return jsonify(orders_schema.dump(results))

        result = Order.query.get(id)
        return jsonify(order_schema.dump(result))
    @staticmethod
    def post():
        type = request.json["type"]
        trade_date = request.json["trade_date"]
        client_leg = request.json["client_leg"]
        market_leg = request.json["market_leg"]
        create_user = request.json["create_user"]
        create_at = datetime.now()
        update_user = 0
        update_at = datetime.now()
        status = "Active"

        result = Order(type, trade_date, client_leg, market_leg, create_at, create_user, update_at, update_user, status)
        try:
            db.session.add(result)
            db.session.commit()
            db.session.flush()
            # db.session.refresh(client)
        except Exception as err:
            print(err)
            return jsonify({"Message": "Something wrong to insert data!", "Status": 0})

        return jsonify({"Message": f"Order generated.", "Status": 1})

    @staticmethod
    def put():
        try: id = request.args['id']
        except Exception as _: id = None
        if not id:
            return jsonify({ 'Message': 'Must provide the order ID', "Status": 0 })
        result = Order.query.get(id)

        if request.json is None:
            result.update_at = datetime.now() 
        else:
            if "type" in request.json:
                result.type = request.json["type"]
            if "trade_date" in request.json:    
                result.trade_date = request.json["trade_date"] 
            if "client_leg" in request.json:            
                result.client_leg = request.json["client_leg"] 
            if "market_leg" in request.json:            
                result.market_leg = request.json["market_leg"] 
            if "update_user" in request.json:            
                result.type = request.json["update_user"]
            if "status" in request.json:            
                result.status = request.json["status"]
            result.update_at = datetime.now() 
        
        try:
            db.session.commit()
        except Exception:
            return jsonify({"Message": "Something wrong to update data!", "Status": 0})

        return jsonify({'Message': f'Order modified.', "Status": 1})

    @staticmethod
    def delete():
        try:
            id = request.args["id"]
        except Exception as _:
            id = None
        if not id:
            return jsonify({"Message": "Must provide the Order ID", "Status": 0})
        result = Order.query.get(id)

        try:
            db.session.delete(result)
            db.session.commit()
        except Exception:
            return jsonify({"Message": "Not found", "Status": 0})

        return jsonify({"Message": f"Order info deleted.", "Status": 1})

api.add_resource(ClientManager, "/api/clients")
api.add_resource(VenueManager, "/api/venues")
api.add_resource(EmailManager, "/api/emails")
api.add_resource(WalletManager, "/api/wallets")
api.add_resource(BankManager, "/api/banks")
api.add_resource(OrderManager, "/api/orders")

if __name__ == "__main__":
    app.run(debug=True)
