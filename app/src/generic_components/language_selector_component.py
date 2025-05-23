# src/generic_components/language_selector_component.py
import dash_bootstrap_components as dbc
from dash import (
    Dash,
    html,
    dcc,
    callback,
    Output,
    Input,
)

language_options = [
    {'label': 'English', 'value': 'en'},
    {'label': 'Thai', 'value': 'th'}
]

language_dictionary = {
    'en': {
        'tab_manuals': 'User Manuals',
        'tab_map': 'Map Application',
        'download_manuals_heading': 'Download User Manuals',
        'download_manuals_paragraph': 'Click the links below to download the user manuals in PDF format.',
        'vm_admin_manual_button': 'VM Administrator Manual',
        'vm_business_manual_button': 'VM Business Solution Manual',
        'vm_user_training_button': 'VM User Training',
        'optimization_heading': 'Run Optimization Model',
        'optimization_paragraph': 'Enter SAIFI and Budget values to run the optimization model scenario.',
        'saifi_label': 'SAIFI',
        'budget_label': 'Budget',
        'saifi_input': 'Enter SAIFI value',
        'budget_input': 'Enter Budget value',
        'run_optimization_button': 'Run Optimization',
        'open_overview_button': 'Overview',
        'deep_dive_button': 'Asset Details',
        'data_upload_heading': 'Data Upload',
        'data_upload_paragraph': 'Upload data file for rate card and outages (ENS Report 52)',
        'rate_card_heading': 'Rate Card Data - Replace',
        'download_rate_card_button': 'Download Data',
        'upload_rate_card_button': 'Upload Data',
        'outage_heading': 'Outage Data from ENS Report 52 - Append',
        'download_outage_button': 'Download Data',
        'upload_outage_button': 'Upload Data',

    },
    'th': {
        'tab_manuals': 'คู่มือใช้งาน',
        'tab_map': 'แผนที่',
        'download_manuals_heading': 'ดาวน์โหลดคู่มือ',
        'download_manuals_paragraph': 'คลิกที่ลิงก์ด้านล่างเพื่อดาวน์โหลดคู่มือในรูปแบบ PDF',
        'vm_admin_manual_button': 'คู่มือ Admin ระบบ',
        'vm_business_manual_button': 'คู่มือโซลูชันทางธุรกิจ',
        'vm_user_training_button': 'คู่มือ user front-end',
        'optimization_heading': 'รัน Optimization Model',
        'optimization_paragraph': 'ป้อนค่า SAIFI และงบประมาณเพื่อจำลอง optimization model',
        'saifi_label': 'SAIFI',
        'budget_label': 'งบประมาณ',
        'saifi_input': 'ป้อนค่า SAIFI',
        'budget_input': 'ป้อนค่างบประมาณ',
        'run_optimization_button': 'รัน optimization model',
        'open_overview_button': 'ภาพรวม',
        'deep_dive_button': 'รายละเอียดอุปกรณ์',
        'data_upload_heading': 'อัปโหลดข้อมูล',
        'data_upload_paragraph': 'อัปโหลดข้อมูลราคากลางและข้อมูล Outage จาก ENS Report 52',
        'rate_card_heading': 'ข้อมูลราคากลาง (ทั้งหมด)',
        'download_rate_card_button': 'ดาวน์โหลดข้อมูลล่าสุด',
        'upload_rate_card_button': 'อัปโหลดข้อมูล',
        'outage_heading': 'ข้อมูล Outage จาก ENS Report 52 (ข้อมูลเพิ่มเติมจากเดิม)',
        'download_outage_button': 'ดาวน์โหลดข้อมูลล่าสุด',
        'upload_outage_button': 'อัปโหลดข้อมูล',
    }
}

def inject_callbacks(app):

    @app.callback(
        [
            Output('tab_manuals', 'label'),
            Output('tab_map', 'label'),
            Output('download_manuals_heading', 'children'),
            Output('download_manuals_paragraph', 'children'),
            Output('vm_admin_manual_button', 'children'),
            Output('vm_business_manual_button', 'children'),
            Output('vm_user_training_button', 'children'),
            Output('optimization_heading', 'children'),
            Output('optimization_paragraph', 'children'),
            Output('saifi_label', 'children'),
            Output('budget_label', 'children'),
            Output('saifi_input', 'placeholder'),
            Output('budget_input', 'placeholder'),
            Output('run_optimization_button', 'children'),
            Output('open_overview_button', 'children'),
            Output('deep_dive_button', 'children'),
            Output('data_upload_heading', 'children'),
            Output('data_upload_paragraph', 'children'),
            Output('rate_card_heading', 'children'),
            Output('download_rate_card_button', 'children'),
            Output('upload_rate_card_button', 'children'),
            Output('outage_heading', 'children'),
            Output('download_outage_button', 'children'),
            Output('upload_outage_button', 'children'),
        ],
        [
            Input('language-selector', 'value')
        ]
    )
    def update_language(selected_language):
        language_pack = language_dictionary.get(selected_language, language_dictionary['en']) # default to english if language not found
        return [
        language_pack['tab_manuals'],
        language_pack['tab_map'],
        language_pack['download_manuals_heading'],
        language_pack['download_manuals_paragraph'],
        language_pack['vm_admin_manual_button'],
        language_pack['vm_business_manual_button'],
        language_pack['vm_user_training_button'],
        language_pack['optimization_heading'],
        language_pack['optimization_paragraph'],
        language_pack['saifi_label'],
        language_pack['budget_label'],
        language_pack['saifi_input'],
        language_pack['budget_input'],
        language_pack['run_optimization_button'],
        language_pack['open_overview_button'],
        language_pack['deep_dive_button'],
        language_pack['data_upload_heading'],
        language_pack['data_upload_paragraph'],
        language_pack['rate_card_heading'],
        language_pack['download_rate_card_button'],
        language_pack['upload_rate_card_button'],
        language_pack['outage_heading'],
        language_pack['download_outage_button'],
        language_pack['upload_outage_button'],
    ]
    return app


    