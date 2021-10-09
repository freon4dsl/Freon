// Generated by the ProjectIt Language Generator.
// This file contains the input to the AGL parser generator (see https://https://github.com/dhakehurst/net.akehurst.language).
// The grammar in this file is read by ....

export const ExModelGrammarStr = `
namespace ExampleLanguage
grammar ExModel {
                
ExModel = 'model' identifier '{' 
	Entity* 
	'model' 'wide' 'Methods:' 
	Method* 
	'}'  ;

Entity = 'Entity' identifier ('base' EntityPiElemRef)? '{' 
	Attribute* 
	Method* 
	'}'  ;

Attribute = identifier ':' TypePiElemRef  ;

Method = 'method' identifier '(' [Parameter / ',' ]* '):' TypePiElemRef '{' 
	ExExpression 
	'}'  ;

StringLiteralExpression = '\\'' stringLiteral '\\''  ;

AttributeRef = AttributePiElemRef  ;

NumberLiteralExpression = numberLiteral  ;

BooleanLiteralExpression = booleanLiteral  ;

AbsExpression = '|' ExExpression '|'  ;

ParameterRef = ParameterPiElemRef '.' AppliedFeature  ;

GroupedExpression = '(' ExExpression ')'  ;

LoopVariableRef = LoopVariablePiElemRef  ;

SumExpression = 'sum' 'from' LoopVariable '=' ExExpression 'to' ExExpression 'of' ExExpression  ;

LoopVariable = identifier  ;

MethodCallExpression = 'CALL' MethodPiElemRef '(' [ExExpression / ',' ]* ')'  ;

IfExpression = 'if' '(' ExExpression ')' 'then' 
	ExExpression 
	'else' 
	ExExpression 
	'endif'  ;

Parameter = identifier ':' TypePiElemRef  ;

ExExpression = LiteralExpression 
    | AbsExpression 
    | ParameterRef 
    | GroupedExpression 
    | LoopVariableRef 
    | SumExpression 
    | MethodCallExpression 
    | IfExpression 
    | __pi_binary_expression ;

LiteralExpression = StringLiteralExpression 
    | NumberLiteralExpression 
    | BooleanLiteralExpression  ;

AppliedFeature = AttributeRef  ;

TypePiElemRef = identifier ;

AttributePiElemRef = identifier ;

ParameterPiElemRef = identifier ;

LoopVariablePiElemRef = identifier ;

MethodPiElemRef = identifier ;

EntityPiElemRef = identifier ;

__pi_binary_expression = [ExExpression / __pi_binary_operator]2+ ;

leaf __pi_binary_operator = '*' | '+' | '/' | 'and' | 'or' | '<' | '>' | '==' ;
        
// white space and comments
skip WHITE_SPACE = "\\s+" ;
skip SINGLE_LINE_COMMENT = "//[^\\r\\n]*" ;
skip MULTI_LINE_COMMENT = "/\\*[^*]*\\*+(?:[^*/][^*]*\\*+)*/" ;
        
// the predefined basic types   
leaf identifier          = "[a-zA-Z_][a-zA-Z0-9_]*" ;
/* see https://stackoverflow.com/questions/37032620/regex-for-matching-a-string-literal-in-java */
leaf stringLiteral       = '"' "[^\\"\\\\]*(\\\\.[^\\"\\\\]*)*" '"' ;
leaf numberLiteral       = "[0-9]+";
leaf booleanLiteral      = 'false' | 'true';
            
}`; // end of grammar
