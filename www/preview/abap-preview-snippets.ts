export type AbapPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const abapPreviewSnippets: AbapPreviewSnippet[] = [
  {
    title: "Classic report",
    description: "a selection screen, ABAP SQL, and a field symbol loop",
    code: `REPORT zflight_list.

*----------------------------------------------------------------------*
* Lists the flights of one carrier with their free seats.
*----------------------------------------------------------------------*
TABLES sflight.

PARAMETERS p_carr TYPE s_carr_id DEFAULT 'LH' OBLIGATORY.
SELECT-OPTIONS s_date FOR sflight-fldate.

START-OF-SELECTION.
  SELECT carrid, connid, fldate, seatsmax, seatsocc
    FROM sflight
    WHERE carrid = @p_carr
      AND fldate IN @s_date
    ORDER BY fldate
    INTO TABLE @DATA(lt_flights).

  IF sy-subrc <> 0.
    MESSAGE 'No flights found'(001) TYPE 'S' DISPLAY LIKE 'E'.
    RETURN.
  ENDIF.

  LOOP AT lt_flights ASSIGNING FIELD-SYMBOL(<ls_flight>).
    DATA(lv_free) = <ls_flight>-seatsmax - <ls_flight>-seatsocc.
    WRITE: / <ls_flight>-connid, <ls_flight>-fldate, lv_free.
  ENDLOOP.`,
  },
  {
    title: "Local class",
    description: "a class definition and implementation with an interface",
    code: `CLASS lcl_cart DEFINITION FINAL.
  PUBLIC SECTION.
    INTERFACES if_oo_adt_classrun.

    TYPES: BEGIN OF ty_item,
             sku      TYPE string,
             quantity TYPE i,
             price    TYPE p LENGTH 10 DECIMALS 2,
           END OF ty_item,
           tt_items TYPE STANDARD TABLE OF ty_item WITH EMPTY KEY.

    METHODS add_item
      IMPORTING iv_sku      TYPE string
                iv_quantity TYPE i DEFAULT 1
                iv_price    TYPE ty_item-price.

    METHODS total
      RETURNING VALUE(rv_total) TYPE ty_item-price.

  PRIVATE SECTION.
    DATA mt_items TYPE tt_items.
ENDCLASS.

CLASS lcl_cart IMPLEMENTATION.
  METHOD add_item.
    APPEND VALUE #( sku = iv_sku quantity = iv_quantity price = iv_price )
      TO mt_items.
  ENDMETHOD.

  METHOD total.
    rv_total = REDUCE #( INIT sum = CONV ty_item-price( 0 )
                         FOR ls_item IN mt_items
                         NEXT sum = sum + ls_item-quantity * ls_item-price ).
  ENDMETHOD.

  METHOD if_oo_adt_classrun~main.
    DATA(lo_cart) = NEW lcl_cart( ).
    lo_cart->add_item( iv_sku = 'A-100' iv_price = '19.90' ).
    lo_cart->add_item( iv_sku = 'B-200' iv_quantity = 3 iv_price = '4.50' ).
    out->write( |Total: { lo_cart->total( ) CURRENCY = 'EUR' }| ).
  ENDMETHOD.
ENDCLASS.`,
  },
  {
    title: "Modern table expressions",
    description:
      "constructor operators, table expressions, and string templates",
    code: `METHOD build_summary.
  " Group the open orders by customer and keep the big ones.
  DATA(lt_open) = FILTER #( mt_orders USING KEY status WHERE status = 'O' ).

  DATA(lt_big) = VALUE tt_summary(
    FOR GROUPS lg_customer OF ls_order IN lt_open
      GROUP BY ls_order-customer
      LET lv_sum = REDUCE netwr( INIT s = 0
                                 FOR m IN GROUP lg_customer
                                 NEXT s = s + m-amount ) IN
      ( customer = lg_customer amount = lv_sum ) ).

  DELETE lt_big WHERE amount < 1000.

  IF line_exists( lt_big[ customer = iv_vip ] ).
    DATA(lv_label) = COND string(
      WHEN lines( lt_big ) > 10 THEN \`many customers\`
      ELSE |{ lines( lt_big ) } customers| ).
    zcl_log=>info( lv_label ) ##NO_TEXT.
  ENDIF.

  rt_result = CORRESPONDING #( lt_big MAPPING kunnr = customer ).
ENDMETHOD.`,
  },
  {
    title: "Exception handling",
    description: "TRY, CATCH INTO, and a class-based exception",
    code: `TRY.
    DATA(lv_ratio) = lv_done / lv_total.
    cl_demo_output=>display( |Progress: { lv_ratio * 100 DECIMALS = 1 }%| ).
  CATCH cx_sy_zerodivide INTO DATA(lx_zero).
    MESSAGE lx_zero->get_text( ) TYPE 'I'.
  CATCH zcx_upload_failed INTO DATA(lx_upload).
    RAISE EXCEPTION NEW zcx_report_failed( previous = lx_upload ).
  CLEANUP.
    CLEAR lv_ratio.
ENDTRY.`,
  },
];
