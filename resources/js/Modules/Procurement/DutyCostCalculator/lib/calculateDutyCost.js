function num(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
}

function money(v) {
    return Number(num(v).toFixed(2));
}

function qty(v, p = 4) {
    return Number(num(v).toFixed(p));
}

export function calculateDutyCostPreview(data) {
    const exchangeRate = num(data.exchange_rate);
    const shippingCostTotal = num(data.shipping_cost_total_lkr);
    const containerCapacity = num(data.container_cbm_capacity);
    const shippingCostPerCbm = containerCapacity > 0 ? money(shippingCostTotal / containerCapacity) : 0;

    const extraCostTotal = (data.other_costs || []).reduce((sum, row) => sum + num(row?.amount_lkr), 0);
    const otherCommonCostPool = money(
        num(data.loading_cost_lkr) +
            num(data.unloading_cost_lkr) +
            num(data.transport_cost_lkr) +
            num(data.delivery_order_charges_lkr) +
            num(data.clearing_charges_lkr) +
            num(data.demurrage_cost_lkr) +
            extraCostTotal,
    );

    const baseItems = (data.items || []).map((row, idx) => {
        const quantity = num(row.quantity);
        const unitPriceForeign = num(row.unit_price_foreign);
        const cbm = num(row.cbm);
        const weightKg = num(row.weight_kg);
        const customsPreset = num(row.customs_preset_value_foreign_or_base);
        const cidRate = num(row.cid_rate_per_kg_lkr || 30);
        const totalProductValueForeign = qty(quantity * unitPriceForeign);
        const productValueLkr = money(totalProductValueForeign * exchangeRate);
        const statisticalValue = money(customsPreset * weightKg * exchangeRate);
        const customsBase110 = money(statisticalValue * 1.1);
        const cid = money(weightKg * cidRate);
        const vat = money((customsBase110 + cid) * 0.18);
        const sscl = money((customsBase110 + cid) * 0.025);
        const dutyTotal = money(cid + vat + sscl);

        return {
            ...row,
            line_no: row.line_no || idx + 1,
            quantity: qty(quantity),
            unit_price_foreign: qty(unitPriceForeign),
            cbm: qty(cbm),
            weight_kg: qty(weightKg),
            customs_preset_value_foreign_or_base: qty(customsPreset),
            cid_rate_per_kg_lkr: money(cidRate),
            total_product_value_foreign: totalProductValueForeign,
            product_value_lkr: productValueLkr,
            statistical_value_lkr: statisticalValue,
            customs_base_110_lkr: customsBase110,
            cid_lkr: cid,
            vat_lkr: vat,
            sscl_lkr: sscl,
            duty_total_lkr: dutyTotal,
        };
    });

    const totalWeight = baseItems.reduce((sum, row) => sum + num(row.weight_kg), 0);
    const totalCbm = baseItems.reduce((sum, row) => sum + num(row.cbm), 0);

    const items = baseItems.map((row) => {
        const allocatedShipping = money(num(row.cbm) * shippingCostPerCbm);
        const allocatedOther =
            totalWeight > 0 ? money((num(row.weight_kg) / totalWeight) * otherCommonCostPool) : 0;
        const totalLanded = money(
            num(row.product_value_lkr) +
                num(row.duty_total_lkr) +
                allocatedShipping +
                allocatedOther,
        );
        const perUnit = num(row.quantity) > 0 ? money(totalLanded / num(row.quantity)) : 0;

        const perUom = {
            landed_cost_per_kg_lkr: null,
            landed_cost_per_meter_lkr: null,
            landed_cost_per_yard_lkr: null,
            landed_cost_per_piece_lkr: null,
            landed_cost_per_set_lkr: null,
        };

        const uom = String(row.unit_of_measure || '').toLowerCase();
        if (uom === 'kg') perUom.landed_cost_per_kg_lkr = perUnit;
        if (uom === 'meter') perUom.landed_cost_per_meter_lkr = perUnit;
        if (uom === 'yard') perUom.landed_cost_per_yard_lkr = perUnit;
        if (uom === 'piece') perUom.landed_cost_per_piece_lkr = perUnit;
        if (uom === 'set') perUom.landed_cost_per_set_lkr = perUnit;

        return {
            ...row,
            allocated_shipping_lkr: allocatedShipping,
            allocated_other_costs_lkr: allocatedOther,
            total_landed_cost_lkr: totalLanded,
            landed_cost_per_unit_lkr: perUnit,
            ...perUom,
        };
    });

    const summary = {
        item_count: items.length,
        total_product_value_lkr: money(items.reduce((sum, row) => sum + num(row.product_value_lkr), 0)),
        total_statistical_value_lkr: money(items.reduce((sum, row) => sum + num(row.statistical_value_lkr), 0)),
        total_cid_lkr: money(items.reduce((sum, row) => sum + num(row.cid_lkr), 0)),
        total_vat_lkr: money(items.reduce((sum, row) => sum + num(row.vat_lkr), 0)),
        total_sscl_lkr: money(items.reduce((sum, row) => sum + num(row.sscl_lkr), 0)),
        total_duty_lkr: money(items.reduce((sum, row) => sum + num(row.duty_total_lkr), 0)),
        total_allocated_shipping_lkr: money(
            items.reduce((sum, row) => sum + num(row.allocated_shipping_lkr), 0),
        ),
        total_allocated_other_costs_lkr: money(
            items.reduce((sum, row) => sum + num(row.allocated_other_costs_lkr), 0),
        ),
        grand_total_landed_cost_lkr: money(
            items.reduce((sum, row) => sum + num(row.total_landed_cost_lkr), 0),
        ),
        total_weight_kg: qty(totalWeight, 3),
        total_cbm: qty(totalCbm, 4),
        shipping_cost_per_cbm_lkr: shippingCostPerCbm,
    };

    return { items, summary, otherCommonCostPool };
}

