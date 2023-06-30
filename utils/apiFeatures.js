class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }
    filter() {
        const queryObj = { ...this.queryString };
        const excludedFields = [
            'page',
            'sort',
            'limit',
            'fields',
        ];

        // Filtering
        excludedFields.forEach((el) => delete queryObj[el]);

        // Advanced filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(
            /\b(gte|gt|lte|lt)\b/g,
            (match) => {
                return `$${match}`;
            }
        );
        this.query.find(JSON.parse(queryStr));
        return this;
    }
    sort() {
        if (this.queryString.sort) {
            // replace for ading more than one option for sorting
            this.query.sort(
                this.queryString.sort.replaceAll(',', ' ')
            );
        } else {
            this.query.sort('-createdAt');
        }
        return this;
    }
    limitFields() {
        if (this.queryString.fields) {
            this.query = this.query.select(
                this.queryString.fields.replaceAll(',', ' ')
            );
        } else {
            // minus means excluding
            // so it deleted __v from query
            this.query = this.query.select('-__v');
        }
        return this;
    }
    paginate() {
        const itemsPerPage =
            this.queryString.limit * 1 || 100;
        const page = this.queryString.page * 1 || 1;
        this.query = this.query
            .skip(itemsPerPage * (page - 1))
            .limit(itemsPerPage);

        return this;
    }
}

module.exports = APIFeatures;
