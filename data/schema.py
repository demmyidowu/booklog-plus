from marshmallow import Schema, fields, ValidationError

class BooksSchema(Schema):
        book_name = fields.String(required = True)
        author_name = fields.String(required = True)
        reflection = fields.String(required = True)