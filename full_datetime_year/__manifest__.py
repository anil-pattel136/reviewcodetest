# -*- coding: utf-8 -*-
{
    "name": "Full Datetime Year",
    "summary": "Always show the year on date and datetime fields in Odoo 19.",
    "version": "19.0.1.0.0",
    "category": "Extra Tools",
    "author": "Custom",
    "license": "LGPL-3",
    "depends": ["web"],
    "assets": {
        "web.assets_backend": [
            "full_datetime_year/static/src/js/full_datetime_year.js",
        ],
    },
    "installable": True,
    "application": False,
}
