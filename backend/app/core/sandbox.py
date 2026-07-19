import ast

class SecurityException(Exception):
    pass

class SecureVisitor(ast.NodeVisitor):
    ALLOWED_NODES = {
        ast.Module, ast.FunctionDef, ast.arguments, ast.arg,
        ast.Assign, ast.Return, ast.If, ast.Compare, ast.BinOp,
        ast.UnaryOp, ast.Subscript, ast.Slice, ast.Name, ast.Store,
        ast.Load, ast.Constant, ast.Attribute, ast.Call, ast.Expr,
        ast.Dict, ast.List, ast.Tuple, ast.keyword,
        # operators
        ast.Add, ast.Sub, ast.Mult, ast.Div, ast.FloorDiv, ast.Mod, ast.Pow,
        ast.Eq, ast.NotEq, ast.Lt, ast.LtE, ast.Gt, ast.GtE,
        ast.And, ast.Or, ast.Not, ast.BitAnd, ast.BitOr, ast.BitXor, ast.Invert,
        ast.USub, ast.UAdd
    }
    
    ALLOWED_BUILTINS = {"range", "len", "print", "float", "int", "str", "bool", "max", "min", "abs", "sum"}

    def generic_visit(self, node):
        if type(node) not in self.ALLOWED_NODES:
            raise SecurityException(f"Syntax element not allowed: {type(node).__name__}")
        super().generic_visit(node)

    def visit_Import(self, node):
        raise SecurityException("Imports are strictly forbidden.")
        
    def visit_ImportFrom(self, node):
        raise SecurityException("Imports are strictly forbidden.")

    def visit_Call(self, node):
        if isinstance(node.func, ast.Name):
            if node.func.id not in self.ALLOWED_BUILTINS:
                raise SecurityException(f"Function call '{node.func.id}' is not allowed.")
        # Attribute calls like df.rolling() are allowed since Attribute is allowed,
        # but we rely on the limited execution environment (locals/globals) to restrict actual objects.
        self.generic_visit(node)

def safe_compile_and_execute(code_str: str, data_df):
    """
    Parses the code into an AST, walks it to ensure no forbidden nodes exist,
    compiles it, and executes it in a constrained namespace.
    """
    try:
        tree = ast.parse(code_str)
    except SyntaxError as e:
        raise ValueError(f"Syntax Error in Alpha logic: {e}")
        
    visitor = SecureVisitor()
    visitor.visit(tree)
    
    # Compile the safe AST
    compiled_code = compile(tree, filename="<ast>", mode="exec")
    
    # Constrain the environment
    local_env = {"data": data_df}
    global_env = {"__builtins__": {k: __builtins__[k] for k in SecureVisitor.ALLOWED_BUILTINS if k in __builtins__}}
    
    # Execute the definition
    exec(compiled_code, global_env, local_env)
    
    if "alpha" not in local_env:
        raise ValueError("The code must define a function named 'alpha'.")
        
    return local_env["alpha"]
