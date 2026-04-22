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

function numOrDefault(v, def) {
    if (v === '' || v === null || v === undefined) {
        return def;
    }
    const n = Number(v);

    return Number.isFinite(n) ? n : def;
}

export function calculateDutyCostPreview(data) {
    const exchangeRate = num(data.exchange_rate);
    const freightExchangeRate = num(data.freight_exchange_rate);
    const freightCostForeign = num(data.freight_cost_total);
    const freightCostLocal = money(freightCostForeign * freightExchangeRate);

    const extraCostTotal = (data.other_costs || []).reduce((sum, row) => sum + num(row?.amount_lkr), 0);
    const otherCommonCostPool = money(
        num(data.loading_unloading_cost_lkr) +
            num(data.transport_cost_lkr) +
            num(data.delivery_order_charges_lkr) +
            num(data.clearing_charges_lkr) +
            num(data.demurrage_cost_lkr) +
            num(data.additional_entry_cost_lkr) +
            extraCostTotal,
    );

    const shipmentCidRate = numOrDefault(data.cid_rate_per_kg_lkr, 0);
    const cidBasis = ['weight', 'uom'].includes(String(data.cid_basis || '').toLowerCase())
        ? String(data.cid_basis).toLowerCase()
        : 'weight';
    const shipmentEidRate = numOrDefault(data.eid_rate_per_kg_lkr, 0);
    const eidBasis = ['weight', 'uom'].includes(String(data.eid_basis || '').toLowerCase())
        ? String(data.eid_basis).toLowerCase()
        : 'weight';
    const statisticalValueBasis = ['weight', 'uom'].includes(
        String(data.statistical_value_basis || '').toLowerCase(),
    )
        ? String(data.statistical_value_basis).toLowerCase()
        : 'weight';
    const dutyBasePercent = numOrDefault(data.duty_base_percent, 0);
    const dutyBaseMultiplier = dutyBasePercent > 0 ? dutyBasePercent / 100 : 0;
    const vatRate = numOrDefault(data.vat_rate_percent, 0) / 100;
    const ssclRate = numOrDefault(data.sscl_rate_percent, 0) / 100;

    const baseItems = (data.items || []).map((row, idx) => {
        const quantity = num(row.quantity);
        const unitPriceForeign = num(row.unit_price_foreign);
        const cbm = num(row.cbm);
        const weightKg = num(row.weight_kg);
        const customsPreset = num(row.customs_preset_value_foreign_or_base);
        const totalProductValueForeign = qty(quantity * unitPriceForeign, 2);
        const productValueLkr = money(totalProductValueForeign * exchangeRate);
        const statisticalBaseValue = statisticalValueBasis === 'uom' ? quantity : weightKg;
        const statisticalValue = money(customsPreset * statisticalBaseValue * exchangeRate);
        const customsBase110 = money(statisticalValue * dutyBaseMultiplier);
        const cidBaseValue = cidBasis === 'uom' ? quantity : weightKg;
        const cid = money(cidBaseValue * shipmentCidRate);
        const eidBaseValue = eidBasis === 'uom' ? quantity : weightKg;
        const eid = money(eidBaseValue * shipmentEidRate);
        const taxBase = customsBase110 + cid + eid;
        const vat = money(taxBase * vatRate);
        const sscl = money(taxBase * ssclRate);
        const dutyTotal = money(cid + eid + vat + sscl);

        return {
            ...row,
            line_no: row.line_no || idx + 1,
            quantity: qty(quantity, 2),
            unit_price_foreign: qty(unitPriceForeign, 2),
            cbm: qty(cbm, 3),
            weight_kg: qty(weightKg, 3),
            customs_preset_value_foreign_or_base: qty(customsPreset, 2),
            cid_rate_per_kg_lkr: money(shipmentCidRate),
            eid_rate_per_kg_lkr: money(shipmentEidRate),
            total_product_value_foreign: totalProductValueForeign,
            product_value_lkr: productValueLkr,
            statistical_value_lkr: statisticalValue,
            customs_base_110_lkr: customsBase110,
            cid_lkr: cid,
            eid_lkr: eid,
            vat_lkr: vat,
            sscl_lkr: sscl,
            duty_total_lkr: dutyTotal,
        };
    });

    const totalWeight = baseItems.reduce((sum, row) => sum + num(row.weight_kg), 0);
    const totalCbm = baseItems.reduce((sum, row) => sum + num(row.cbm), 0);
    const totalShipmentCbm = totalCbm;
    const freightCostPerCbmLocal = totalShipmentCbm > 0 ? money(freightCostLocal / totalShipmentCbm) : 0;

    const purchaseShipmentLkr = money(
        baseItems.reduce((sum, row) => sum + num(row.product_value_lkr), 0),
    );
    const bankBaseLkr = money(purchaseShipmentLkr + freightCostLocal);
    const bankRatePa = num(data.bank_interest_rate_pa);
    const bankMonths = num(data.bank_interest_months);
    const bankTransferCharges = bankBaseLkr > 0 ? money(bankBaseLkr * 0.01) : 0;
    const bankInterest =
        bankBaseLkr > 0 && bankRatePa > 0 && bankMonths > 0
            ? money(bankBaseLkr * (bankRatePa / 100) * (bankMonths / 12))
            : 0;
    const bankChargesPool = money(bankTransferCharges + bankInterest);

    const items = baseItems.map((row) => {
        const allocatedFreight = money(num(row.cbm) * freightCostPerCbmLocal);
        const allocatedOther =
            totalWeight > 0 ? money((num(row.weight_kg) / totalWeight) * otherCommonCostPool) : 0;
        const allocatedBank =
            bankBaseLkr > 0 && bankChargesPool > 0
                ? money(
                      bankChargesPool *
                          ((num(row.product_value_lkr) + allocatedFreight) / bankBaseLkr),
                  )
                : 0;
        const remittanceLkr = money(num(row.product_value_lkr) + allocatedFreight);
        const totalLanded = money(
            num(row.product_value_lkr) +
                num(row.duty_total_lkr) +
                allocatedFreight +
                allocatedOther +
                allocatedBank,
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
            allocated_freight_lkr: allocatedFreight,
            allocated_other_costs_lkr: allocatedOther,
            allocated_bank_charges_lkr: allocatedBank,
            remittance_lkr: remittanceLkr,
            total_landed_cost_lkr: totalLanded,
            landed_cost_per_unit_lkr: perUnit,
            ...perUom,
        };
    });

    const summary = {
        item_count: items.length,
        total_product_value_foreign: qty(
            items.reduce((sum, row) => sum + num(row.total_product_value_foreign), 0),
            2,
        ),
        total_product_value_lkr: money(items.reduce((sum, row) => sum + num(row.product_value_lkr), 0)),
        total_statistical_value_lkr: money(items.reduce((sum, row) => sum + num(row.statistical_value_lkr), 0)),
        total_customs_base_lkr: money(items.reduce((sum, row) => sum + num(row.customs_base_110_lkr), 0)),
        total_cid_lkr: money(items.reduce((sum, row) => sum + num(row.cid_lkr), 0)),
        total_eid_lkr: money(items.reduce((sum, row) => sum + num(row.eid_lkr), 0)),
        total_vat_lkr: money(items.reduce((sum, row) => sum + num(row.vat_lkr), 0)),
        total_sscl_lkr: money(items.reduce((sum, row) => sum + num(row.sscl_lkr), 0)),
        total_duty_lkr: money(items.reduce((sum, row) => sum + num(row.duty_total_lkr), 0)),
        total_allocated_freight_lkr: money(
            items.reduce((sum, row) => sum + num(row.allocated_freight_lkr), 0),
        ),
        total_allocated_other_costs_lkr: money(
            items.reduce((sum, row) => sum + num(row.allocated_other_costs_lkr), 0),
        ),
        bank_transfer_charges_lkr: bankTransferCharges,
        bank_interest_lkr: bankInterest,
        total_bank_charges_lkr: money(
            items.reduce((sum, row) => sum + num(row.allocated_bank_charges_lkr), 0),
        ),
        remittance_lkr: money(purchaseShipmentLkr + freightCostLocal),
        grand_total_landed_cost_lkr: money(
            items.reduce((sum, row) => sum + num(row.total_landed_cost_lkr), 0),
        ),
        total_weight_kg: qty(totalWeight, 3),
        total_cbm: qty(totalCbm, 3),
        freight_cost_per_cbm_lkr: freightCostPerCbmLocal,
    };

    return { items, summary, otherCommonCostPool };
}

