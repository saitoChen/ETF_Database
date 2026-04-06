import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = searchParams.get('limit');

    const dbPath = path.join(process.cwd(), 'etf_data.db');
    const db = new Database(dbPath);

    let query = 'SELECT stat_date, sec_code, sec_name, tot_vol FROM etf_data';
    const params: string[] = [];

    if (startDate && endDate) {
      query += ' WHERE stat_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    } else if (startDate) {
      query += ' WHERE stat_date >= ?';
      params.push(startDate);
    } else if (endDate) {
      query += ' WHERE stat_date <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY stat_date DESC';

    if (limit) {
      const numLimit = parseInt(limit);
      const distinctDates = db.prepare('SELECT DISTINCT stat_date FROM etf_data ORDER BY stat_date DESC LIMIT ?').all(numLimit);
      const dates = distinctDates.map((d: any) => d.stat_date);
      
      if (dates.length > 0) {
        const placeholders = dates.map(() => '?').join(',');
        query = `SELECT stat_date, sec_code, sec_name, tot_vol FROM etf_data WHERE stat_date IN (${placeholders}) ORDER BY stat_date DESC`;
        params.length = 0;
        params.push(...dates);
      }
    }

    const stmt = db.prepare(query);
    const rows = stmt.all(...params);
    db.close();

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching ETF data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
